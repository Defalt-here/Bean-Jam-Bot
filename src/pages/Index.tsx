import { useState, useRef, useEffect } from 'react';
import { BlobAnimation } from '@/components/BlobAnimation';
import { ChatMessage } from '@/components/ChatMessage';
import { WeatherCard, type WeatherCardProps } from '@/components/WeatherCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAudioLevel from '@/hooks/use-audio-level';
import useAudioRecorder from '@/hooks/use-audio-recorder';
import { getGeminiService } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { getUserLocation, formatLocation, type LocationData } from '@/lib/location';
import { getWeather, formatWeatherSummary, parseDateFromMessage, extractWeatherCardData } from '@/lib/weather';
import { logBrowserInfo, isVoiceRecordingSupported, getCompatibilityMessage } from '@/lib/browser-compat';

interface Message {
  content: string;
  isUser: boolean;
  weatherData?: WeatherCardProps;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // language is provided by context
  const { language } = useLanguage();
  const recorder = useAudioRecorder();
  const levels = useAudioLevel(recorder.isRecording);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const locationFetchedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update document language and title when selected language changes
  useEffect(() => {
    document.title = language === 'en' ? 'Bean Jam Bot | Date planning AI' : 'ビーンジャムボット | デートプランニングAI';
    try {
      document.documentElement.lang = language === 'en' ? 'en' : 'ja';
    } catch (e) {
      // ignore in environments without document
    }
  }, [language]);

  // Fetch user location on mount (silently in background)
  useEffect(() => {
    if (locationFetchedRef.current) return;
    locationFetchedRef.current = true;

    // Log browser compatibility info on first load
    logBrowserInfo();

    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        // Silent fail
      }
    };

    fetchLocation();
  }, []);

  // Keep translations here for UI strings
  const translations = {
    en: {
      placeholder: 'Type your message...',
      send: 'SEND',
      title: 'BEAN JAM BOT',
      subtitle: 'Ask beanie whether you should plan a restaurant hopping session or a date or just restaurant recommendations',
      startRecording: 'Start voice input',
      stopRecording: 'Stop recording',
      mic: 'Mic',
      stop: 'Stop',
      recordingStarted: 'Recording started',
      recordingHint: 'Press the mic button again to stop recording',
    },
    jp: {
      placeholder: 'メッセージを入力...',
      send: '送信',
      title: 'ビーンジャムボット',
      subtitle: 'ビーニーに、レストランホッピング、デート、またはおすすめレストランについて聞いてみよう！',
      startRecording: '音声入力開始',
      stopRecording: '録音停止',
      mic: 'マイク',
      stop: '停止',
      recordingStarted: '録音開始',
      recordingHint: 'マイクボタンをもう一度押すと録音を停止します',
    },
  };

  const simulateResponse = async (userMessage: string) => {
    setIsLoading(true);
    setIsCreating(true); // Show create animation while Gemini is thinking
    try {
      const locationContext = userLocation ? formatLocation(userLocation) : undefined;
      let weatherContext: string | undefined;
      let weatherCardData: WeatherCardProps | undefined;

      // Always fetch weather data if location is available
      // Gemini will decide whether to show the weather card based on the user's question
      if (userLocation && (userLocation.latitude || userLocation.city)) {
        try {
          const days = parseDateFromMessage(userMessage, language);
          const forecastDays = days > 0 ? days + 1 : 1; // Include current day + future days
          const weatherData = await getWeather(userLocation, forecastDays);
          weatherContext = formatWeatherSummary(weatherData, language);
          // Prepare weather card data in case Gemini decides to show it
          weatherCardData = extractWeatherCardData(weatherData, days);
        } catch (weatherError) {
          // Continue without weather data - Gemini will respond without it
        }
      }

      const gemini = getGeminiService();
      const result = await gemini.generateResponse(
        userMessage, 
        language, 
        messages, 
        locationContext,
        weatherContext
      );
      
      // Only include weather card data if Gemini indicated it should be shown
      setMessages(prev => [...prev, { 
        content: result.response, 
        isUser: false,
        weatherData: result.showWeatherCard ? weatherCardData : undefined
      }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      
      // Show error toast
      toast({
        title: language === 'en' ? 'Error' : 'エラー',
        description: errorMessage,
        variant: 'destructive',
      });

      // Fallback message
      const fallbackMsg = language === 'en' 
        ? 'Sorry, I encountered an error. Please check your API key configuration and try again.'
        : '申し訳ありません。エラーが発生しました。APIキーの設定を確認して、もう一度お試しください。';
      
      setMessages(prev => [...prev, { content: fallbackMsg, isUser: false }]);
    } finally {
      setIsLoading(false);
      setIsCreating(false); // Stop create animation when response is complete
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    const newMessage = { content: input, isUser: true };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    simulateResponse(input);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BlobAnimation isLoading={isLoading || isCreating || recorder.isRecording} isBehind={hasStartedChat} mode={isCreating ? 'create' : 'normal'} levels={levels} />
      
      <div className="fixed top-0 left-0 right-0 flex justify-center pt-6 z-20">
        <LanguageToggle />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {!hasStartedChat ? (
          <div className="text-center space-y-8">
            <h1 className="font-mono text-6xl font-bold text-foreground tracking-tight">
              {translations[language].title}
            </h1>
            <p className="font-mono text-lg text-muted-foreground">
              {translations[language].subtitle}
            </p>
          </div>
        ) : (
          <div 
            className="w-full max-w-4xl h-[70vh] backdrop-blur-xl bg-glass border-2 border-foreground flex flex-col chat-card-shadow"
          >
            <div className="flex-1 overflow-y-auto p-6 brutalist-scrollbar">
              {messages.map((message, index) => (
                <div key={index}>
                  {message.weatherData && !message.isUser && (
                    <div className="flex justify-start mb-4">
                      <WeatherCard {...message.weatherData} />
                    </div>
                  )}
                  <ChatMessage
                    content={message.content}
                    isUser={message.isUser}
                    language={language}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-3 border-2 border-foreground bg-background font-mono text-sm">
                    <span className="inline-block animate-pulse">...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t-2 border-foreground p-4 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={translations[language].placeholder}
                className="flex-1 border-2 border-foreground font-mono focus-visible:ring-0 focus-visible:ring-offset-0 bg-background"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={async () => {
                  // Check browser compatibility first
                  if (!recorder.isRecording) {
                    const compatMessage = getCompatibilityMessage();
                    if (compatMessage) {
                      toast({ 
                        title: language === 'en' ? 'Voice Recording Not Supported' : '音声録音非対応', 
                        description: compatMessage,
                        variant: 'destructive',
                        duration: 8000
                      });
                      return;
                    }
                  }
                  
                  // toggle recording via recorder hook
                  if (!recorder.isRecording) {
                    try {
                      await recorder.start();
                      toast({ 
                        title: translations[language].recordingStarted, 
                        description: translations[language].recordingHint,
                        duration: 3000 
                      });
                    } catch (err) {
                      const errorMsg = err instanceof Error ? err.message : String(err);
                      toast({ 
                        title: language === 'en' ? 'Microphone error' : 'マイクエラー', 
                        description: errorMsg, 
                        variant: 'destructive',
                        duration: 6000
                      });
                    }
                  } else {
                    // stop, upload, transcribe
                    const blob = await recorder.stop();
                    const uploadingToast = toast({ title: language === 'en' ? 'Transcribing...' : '文字起こし中', description: '', duration: 10000 });
                    try {
                      const result = await recorder.sendToServer(blob, language === 'en' ? 'en-US' : 'ja-JP');
                      toast({ title: language === 'en' ? 'Transcribed' : '文字起こし完了', description: result.transcript });
                      // add as visible user message and send
                      setMessages(prev => [...prev, { content: result.transcript, isUser: true }]);
                      if (!hasStartedChat) setHasStartedChat(true);
                      simulateResponse(result.transcript);
                    } catch (err) {
                      toast({ title: language === 'en' ? 'Transcription failed' : '文字起こし失敗', description: String(err), variant: 'destructive' });
                    }
                    // remove uploading toast if any
                    try { uploadingToast?.dismiss?.(); } catch (e) { /* noop */ }
                  }
                }}
                className={`px-3 py-2 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors duration-150 font-mono text-sm ${recorder.isRecording ? 'text-red-500' : ''}`}
                title={recorder.isRecording ? translations[language].stopRecording : translations[language].startRecording}
              >
                {recorder.isRecording ? translations[language].stop : translations[language].mic}
              </button>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground font-mono font-bold transition-colors"
              >
                {translations[language].send}
              </Button>
            </form>
          </div>
        )}

        {!hasStartedChat && (
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-12 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={translations[language].placeholder}
              className="flex-1 border-2 border-foreground font-mono focus-visible:ring-0 focus-visible:ring-offset-0 bg-background text-lg py-6"
            />
            <button
              type="button"
              onClick={async () => {
                if (!recorder.isRecording) {
                  try {
                    await recorder.start();
                    toast({ 
                      title: translations[language].recordingStarted, 
                      description: translations[language].recordingHint,
                      duration: 3000 
                    });
                  } catch (err) {
                    toast({ title: language === 'en' ? 'Microphone error' : 'マイクエラー', description: String(err), variant: 'destructive' });
                  }
                } else {
                  const blob = await recorder.stop();
                  const uploadingToast = toast({ title: language === 'en' ? 'Transcribing...' : '文字起こし中', description: '', duration: 10000 });
                  try {
                    const result = await recorder.sendToServer(blob, language === 'en' ? 'en-US' : 'ja-JP');
                    toast({ title: language === 'en' ? 'Transcribed' : '文字起こし完了', description: result.transcript });
                    setMessages(prev => [...prev, { content: result.transcript, isUser: true }]);
                    if (!hasStartedChat) setHasStartedChat(true);
                    simulateResponse(result.transcript);
                  } catch (err) {
                    toast({ title: language === 'en' ? 'Transcription failed' : '文字起こし失敗', description: String(err), variant: 'destructive' });
                  }
                  try { uploadingToast?.dismiss?.(); } catch (e) { /* noop */ }
                }
              }}
              className={`px-3 py-2 border-2 border-foreground bg-background hover:bg-foreground hover:text-background transition-colors duration-150 font-mono text-sm ${recorder.isRecording ? 'text-red-500' : ''}`}
              title={recorder.isRecording ? translations[language].stopRecording : translations[language].startRecording}
            >
              {recorder.isRecording ? translations[language].stop : translations[language].mic}
            </button>

            <Button 
              type="submit"
              className="border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground font-mono font-bold text-lg px-8 py-6 transition-colors"
            >
              {translations[language].send}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Index;
