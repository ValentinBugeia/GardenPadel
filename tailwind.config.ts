import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        garden: {
          blue: "hsl(var(--blue))",
          "blue-dark": "hsl(var(--blue-dark))",
          "blue-light": "hsl(var(--blue-light))",
          pink: "hsl(var(--pink))",
          "pink-dark": "hsl(var(--pink-dark))",
          "pink-light": "hsl(var(--pink-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "50px",
      },
      boxShadow: {
        blue: "var(--shadow-blue)",
        pink: "var(--shadow-pink)",
        card: "var(--shadow-card)",
      },
      animation: {
        "float-up": "floatUp linear infinite",
        "hero-zoom": "heroZoom 22s ease-in-out infinite alternate",
        blink: "blink 2s infinite",
        "scroll-line": "scrollLine 2s ease-in-out infinite",
        "fade-in-down": "fadeInDown 0.8s ease forwards",
        "fade-in-up": "fadeInUp 0.9s ease both",
        "fade-in-up-delay1": "fadeInUp 0.9s 0.1s ease both",
        "fade-in-up-delay2": "fadeInUp 0.9s 0.2s ease both",
        "fade-in-up-delay3": "fadeInUp 0.9s 0.3s ease both",
        "fade-in-right": "fadeInRight 1s 0.5s ease both",
        "fade-in": "fadeIn 1.2s 1s ease both",
        wiggle: "wiggle 0.65s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
