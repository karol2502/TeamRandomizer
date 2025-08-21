# Team Randomizer

A powerful web application for creating balanced teams with custom constraints. Built with React, TypeScript, TailwindCSS, and shadcn/ui.

## Features

### 🎯 **Player Management**
- Add players with names and skill levels (0-10)
- Edit existing players inline
- Delete players with automatic constraint cleanup
- View team statistics (total players, skill points, average skill per team)

### 🔗 **Team Constraints**
- **Must play together**: Force specific players onto the same team
- **Cannot play together**: Force specific players onto different teams
- Visual constraint management with icons and color coding
- Automatic constraint validation

### ⚽ **Intelligent Team Generation**
- Advanced balancing algorithm that considers both skill levels and constraints
- Support for 2-6 teams
- Multiple generation attempts to find optimal balance
- Real-time team balance analysis
- Skill variance minimization

### 🌍 **Internationalization**
- Full support for English and Polish
- Dynamic language switching
- All text externalized for easy translation

### 🎨 **Theme Support**
- Light, dark, and system theme modes
- Persistent theme selection
- Beautiful UI with shadcn/ui components

### 💾 **Data Persistence**
- Automatic localStorage saving
- Import/Export functionality via JSON files
- Shareable links with Base64-encoded data
- URL-based team sharing

### 📱 **Responsive Design**
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interface

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/team-maker.git
cd team-maker

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173/`

### Building for Production

```bash
# Build for production
pnpm build

# Preview the production build
pnpm preview
```

## How It Works

### Team Generation Algorithm

The application uses a sophisticated algorithm that:

1. **Constraint Processing**: First handles "must play together" constraints by placing paired players on the same team
2. **Skill Balancing**: Distributes remaining players to minimize skill variance between teams
3. **Constraint Validation**: Ensures "cannot play together" constraints are respected
4. **Multiple Attempts**: Runs up to 2000 iterations to find the best possible team configuration
5. **Scoring System**: Evaluates teams based on constraint violations and skill balance

### Data Sharing

Teams can be shared via:
- **URL Links**: Data is Base64-encoded and embedded in the URL query parameter
- **JSON Export**: Full data export for backup or transfer between devices
- **localStorage**: Automatic saving for session persistence

## Usage Examples

### Basic Team Creation
1. Add players with their skill levels
2. Click "Generate Teams" 
3. View balanced teams with skill distribution

### With Constraints
1. Add players
2. Set constraints (e.g., "John and Jane must play together")
3. Generate teams that respect these rules
4. Share results via generated link

### Advanced Scenarios
- Create 3-6 teams for larger groups
- Mix skill levels strategically
- Use constraints for friend groups or rival players
- Export data for tournament organization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ for team organization and fair play!
