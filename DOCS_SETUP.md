# 📚 GitHub Pages Documentation Setup

This guide will help you set up and deploy your Bean Jam Bot documentation to GitHub Pages using MkDocs Material.

## ✅ What's Already Done

I've set up the complete documentation structure for you:

```
Bean-Jam-Bot/
├── docs/                          # Documentation source files
│   ├── index.md                  # Home page (from Readme.md)
│   ├── getting-started/
│   │   ├── overview.md          # Project overview
│   │   └── installation.md      # Installation guide
│   ├── architecture/
│   │   ├── system-design.md     # System Design doc
│   │   ├── frontend.md          # Frontend doc
│   │   └── backend.md           # Backend doc
│   ├── features/
│   │   ├── weather-detection.md
│   │   └── browser-compatibility.md
│   └── deployment/
│       ├── quick-deploy.md
│       ├── production.md
│       └── aws-lambda.md
├── mkdocs.yml                    # MkDocs configuration
├── requirements.txt              # Python dependencies
└── .github/workflows/docs.yml    # Auto-deploy workflow
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install MkDocs Material

Open PowerShell and run:

```powershell
pip install mkdocs-material mkdocs-glightbox
```

### Step 2: Test Locally

Preview your documentation site:

```powershell
cd "c:\Users\Adity\OneDrive - Bharatividyapeeth\Backup\Web\Bean Jam Bot\Bean-Jam-Bot"
mkdocs serve
```

Open your browser to: http://127.0.0.1:8000

### Step 3: Deploy to GitHub Pages

```powershell
mkdocs gh-deploy
```

That's it! Your documentation will be live at:
**https://defalt-here.github.io/Bean-Jam-Bot/**

## 🔄 Automatic Deployment

I've set up GitHub Actions to automatically deploy your docs when you:
1. Push changes to the `main` branch
2. Modify any files in the `docs/` folder or `mkdocs.yml`

No manual deployment needed after the initial setup!

## 🎨 Features

Your documentation site includes:

- ✅ **Beautiful Material Design** theme
- ✅ **Light/Dark mode** toggle
- ✅ **Search functionality** built-in
- ✅ **Mobile responsive** design
- ✅ **Code syntax highlighting**
- ✅ **Navigation tabs** for easy browsing
- ✅ **Copy code button** on all code blocks
- ✅ **Emoji support** 🎉
- ✅ **Image lightbox** for screenshots

## 📝 How to Update Documentation

### Edit Existing Pages

Simply edit the markdown files in the `docs/` folder:

```powershell
# Edit the overview page
code "docs\getting-started\overview.md"

# Edit frontend docs
code "docs\architecture\frontend.md"
```

### Add New Pages

1. Create a new `.md` file in `docs/`:
   ```powershell
   New-Item -Path "docs\features\new-feature.md" -ItemType File
   ```

2. Add it to `mkdocs.yml` navigation:
   ```yaml
   nav:
     - Features:
         - New Feature: features/new-feature.md
   ```

3. Write your content using Markdown

### Preview Changes

Always preview before deploying:
```powershell
mkdocs serve
```

### Deploy Changes

**Option A: Automatic** (Recommended)
```powershell
git add .
git commit -m "Update documentation"
git push origin main
```
GitHub Actions will automatically deploy!

**Option B: Manual**
```powershell
mkdocs gh-deploy
```

## 🎨 Customization

### Change Theme Colors

Edit `mkdocs.yml`:

```yaml
theme:
  palette:
    - scheme: default
      primary: teal      # Change to: indigo, blue, purple, etc.
      accent: cyan       # Change to: pink, orange, yellow, etc.
```

### Add Your Logo

1. Place logo in `docs/assets/logo.png`
2. Update `mkdocs.yml`:
   ```yaml
   theme:
     logo: assets/logo.png
   ```

### Add Google Analytics

Update `mkdocs.yml`:
```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX
```

## 📚 Markdown Features

### Admonitions (Info Boxes)

```markdown
!!! note
    This is a note

!!! warning
    This is a warning

!!! tip
    This is a tip
```

### Code Blocks with Syntax Highlighting

````markdown
```typescript
const greeting = "Hello World";
```
````

### Tabs

```markdown
=== "JavaScript"
    ```js
    console.log("Hello");
    ```

=== "Python"
    ```python
    print("Hello")
    ```
```

### Tables

```markdown
| Feature | Status |
|---------|--------|
| Voice   | ✅     |
| Weather | ✅     |
```

## 🔧 Troubleshooting

### Issue: `mkdocs` command not found

**Solution:**
```powershell
pip install --upgrade mkdocs-material
# Or add to PATH
$env:Path += ";$env:APPDATA\Python\Python311\Scripts"
```

### Issue: GitHub Pages not showing

**Solution:**
1. Go to GitHub repo settings
2. Click "Pages" in sidebar
3. Ensure Source is set to "gh-pages" branch
4. Wait 2-3 minutes for deployment

### Issue: Changes not reflecting

**Solution:**
```powershell
# Clear browser cache, or
# Force refresh: Ctrl + Shift + R
```

## 📖 Useful Commands

```powershell
# Start dev server
mkdocs serve

# Build static site
mkdocs build

# Deploy to GitHub Pages
mkdocs gh-deploy

# Check for broken links
mkdocs build --strict

# Preview with specific address
mkdocs serve -a 0.0.0.0:8000
```

## 🌐 Access Your Documentation

After deployment, your docs will be available at:

**Main Site:** https://defalt-here.github.io/Bean-Jam-Bot/

**Direct Pages:**
- Overview: https://defalt-here.github.io/Bean-Jam-Bot/getting-started/overview/
- System Design: https://defalt-here.github.io/Bean-Jam-Bot/architecture/system-design/
- Frontend: https://defalt-here.github.io/Bean-Jam-Bot/architecture/frontend/
- Backend: https://defalt-here.github.io/Bean-Jam-Bot/architecture/backend/

## 📱 Share Your Docs

Add the documentation link to your main README.md:

```markdown
## 📚 Documentation

Full documentation is available at: https://defalt-here.github.io/Bean-Jam-Bot/
```

## 🎯 Next Steps

1. Run `mkdocs serve` to preview locally
2. Run `mkdocs gh-deploy` to publish
3. Customize colors and theme in `mkdocs.yml`
4. Add more content to `docs/` folder
5. Share your beautiful docs! 🎉

## 💡 Pro Tips

1. **Use emojis** in headings for visual appeal 🎨
2. **Add screenshots** to features/ folder
3. **Keep navigation simple** - max 2-3 levels deep
4. **Use code examples** liberally
5. **Update regularly** - fresh docs = happy users

---

**Need Help?** Check the [MkDocs Material Documentation](https://squidfunk.github.io/mkdocs-material/)
