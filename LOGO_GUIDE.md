# Logo Usage Guide

## TypeMonkey Logo

The TypeMonkey logo is a custom SVG design that adapts to your application's theme. It consists of:

- **Main Shape**: A rounded rectangle representing a keyboard or typing interface
- **Letter "T"**: The central character representing "Type"
- **Underline**: A subtle line suggesting text input
- **Accent Dot**: A green circle indicating activity or success

## Component Usage

### Basic Logo Component

```tsx
import Logo from './components/Logo';

// Basic usage
<Logo />

// With customization
<Logo 
  size="large" 
  showText={true} 
  className="custom-logo" 
/>
```

### Size Options

- `small`: 24px icon
- `medium`: 32px icon (default)
- `large`: 48px icon

### Props

- `size`: Logo size variant
- `showText`: Whether to show "TypeMonkey" text
- `className`: Additional CSS classes

## Theme Integration

The logo automatically adapts to your application's theme using CSS custom properties:

```css
:root {
  --logo-primary: #e2b714;     /* Logo background */
  --logo-background: #ffffff;  /* Text color */
  --logo-secondary: #f8f9fa;   /* Underline color */
  --logo-accent: #48bb78;      /* Accent dot color */
}
```

## File Structure

```
public/
├── tm_logo.svg           # Main logo file
├── favicon-16x16.svg     # Small favicon
├── favicon-32x32.svg     # Standard favicon
└── manifest.json         # PWA manifest with logo references

src/
├── components/
│   ├── Logo.tsx          # Main logo component
│   └── Logo.css          # Logo styles
└── styles/
    └── logo-theme.css    # Theme-aware styles
```

## Usage Examples

### Navbar
```tsx
<Logo size="medium" showText={true} />
```

### Auth Pages
```tsx
<Logo size="large" showText={true} />
```

### Footer
```tsx
<Logo size="small" showText={false} />
```

## Browser Support

- Modern browsers: Full SVG support with theme switching
- Legacy browsers: Fallback to default colors
- PWA: Manifest integration for home screen icons

## Customization

To customize the logo for your brand:

1. Edit `tm_logo.svg` in the public folder
2. Update CSS custom properties in `logo-theme.css`
3. Modify the Logo component props as needed

The logo is designed to be scalable and theme-aware, ensuring consistent branding across your application.
