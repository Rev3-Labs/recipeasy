# 🍳 Recipeasy

> The easiest way to save, organize, and discover your favorite recipes from around the web

Recipeasy is a modern, intuitive recipe management application that allows you to collect, organize, and manage your favorite recipes from any website. Simply paste a recipe URL and Recipeasy will automatically extract all the important details for you.

![Recipeasy Preview](public/recipeasy.png)

## ✨ Features

### 🔗 **Smart Recipe Import**

- **One-Click Import**: Just paste any recipe URL and Recipeasy extracts all the details
- **Automatic Parsing**: Intelligently extracts ingredients, directions, cooking times, and more
- **Image Support**: Automatically captures recipe images
- **Source Tracking**: Always know where your recipes came from

### ⭐ **Rating & Favorites**

- **Original Ratings**: View ratings from the original recipe source
- **Personal Ratings**: Rate recipes with your own 1-5 star system
- **Favorites**: Mark your most-loved recipes as favorites
- **Quick Filtering**: Filter recipes by favorites or categories

### 🏷️ **Organization**

- **Smart Categories**: Automatically categorizes recipes based on content
- **Custom Tags**: Add your own tags and categories
- **Search**: Find recipes by name, ingredients, or tags
- **Dynamic Filtering**: Filter by categories, favorites, or custom tags

### 📝 **Recipe Management**

- **Editable Content**: Modify ingredients, directions, and notes
- **Personal Notes**: Add your own tips, variations, and comments
- **Serving Adjustments**: Track and modify serving sizes
- **Image Updates**: Replace or update recipe images

### 📱 **Modern Experience**

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **PWA Support**: Install as a mobile app
- **Dark/Light Mode**: Beautiful themes for any preference
- **Fast & Reliable**: Built with modern web technologies

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/recipeasy.git
   cd recipeasy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Storage**: LocalStorage (easily configurable for other backends)
- **Recipe Parsing**: Cheerio for web scraping

## 📖 Usage

### Adding Recipes

1. **Copy a recipe URL** from any cooking website
2. **Paste it** into the URL input field on the homepage
3. **Click "Add Recipe"** and watch Recipeasy extract all the details
4. **Review and edit** the extracted information as needed

### Managing Recipes

- **View Details**: Click on any recipe card to see the full recipe
- **Edit Content**: Use the edit buttons to modify ingredients, directions, or notes
- **Rate Recipes**: Click the stars to add your personal rating
- **Mark Favorites**: Click the heart icon to add to favorites
- **Add Tags**: Use the tag editor to organize your recipes
- **Search**: Use the search bar to find specific recipes

### Organizing Your Collection

- **Filter by Category**: Click category buttons to see specific types of recipes
- **Favorites Filter**: Click "❤️ Favorites" to see only your favorite recipes
- **Search**: Use the search bar to find recipes by name, ingredients, or tags

## 🎨 Customization

### Themes

Recipeasy supports both light and dark themes. The theme automatically adapts to your system preferences.

### Categories

The app automatically generates categories based on your recipes, but you can also:

- Add custom tags to any recipe
- Create your own category system
- Filter by any combination of tags

## 🔧 Configuration

### Storage Backend

Currently uses LocalStorage for data persistence. To use a different backend:

1. Update `lib/recipe-service.ts` to use your preferred storage solution
2. Modify the data models in `lib/types.ts` if needed
3. Update the API calls in the service functions

### Recipe Parsing

The recipe parsing logic is in `app/actions.ts`. You can customize:

- Supported websites
- Data extraction patterns
- Image handling
- Time format parsing

## 📁 Project Structure

```
recipeasy/
├── app/                    # Next.js app directory
│   ├── actions.ts          # Server actions for recipe parsing
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage with recipe list
│   └── recipe/[id]/        # Dynamic recipe detail pages
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── recipe-card.tsx     # Recipe card component
│   ├── favorite-button.tsx # Favorite toggle component
│   ├── star-rating.tsx     # Rating component
│   └── tag-editor.tsx      # Tag management component
├── contexts/               # React contexts
│   └── user-context.tsx    # User state management
├── lib/                    # Utility libraries
│   ├── types.ts            # TypeScript type definitions
│   ├── recipe-service.ts   # Recipe data management
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── favicon.ico         # Favicon
│   └── apple-touch-icon.png # Apple touch icon
└── styles/                 # Global styles
    └── globals.css         # Global CSS with Tailwind
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and patterns
- Add TypeScript types for new features
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible, unstyled components
- **Next.js** for the amazing React framework
- **Tailwind CSS** for the utility-first styling approach
- **Cheerio** for robust HTML parsing

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/recipeasy/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with ❤️ for food lovers everywhere**

_Happy cooking! 🍳✨_
