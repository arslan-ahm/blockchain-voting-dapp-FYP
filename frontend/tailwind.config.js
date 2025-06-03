/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#0A0A0B",
        foreground: "#FAFAFA",
        card: {
          DEFAULT: "#1A1A1B",
          foreground: "#FAFAFA",
        },
        blue: {
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
        },
        purple: {
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
        },
        pink: {
          400: "#F472B6",
          500: "#EC4899",
        },
        cyan: {
          400: "#22D3EE",
        },
        gray: {
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        neon: {
          blue: "#3B82F6",
          purple: "#A855F7",
          pink: "#EC4899",
          cyan: "#22D3EE",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-neon": "linear-gradient(to right, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
        "neon-glow": "neon-glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: ".9",
            transform: "scale(1.05)",
          },
        },
        "neon-glow": {
          "from": {
            "box-shadow": "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.1)",
          },
          "to": {
            "box-shadow": "0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 50px rgba(59, 130, 246, 0.2)",
          }
        }
      },
      blur: {
        xs: "2px",
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme(colors.blue.400), 0 0 20px theme(colors.blue.500)',
        'neon-purple': '0 0 5px theme(colors.purple.400), 0 0 20px theme(colors.purple.500)',
        'neon-pink': '0 0 5px theme(colors.pink.400), 0 0 20px theme(colors.pink.500)',
        'neon-cyan': '0 0 5px theme(colors.cyan.400), 0 0 20px theme(colors.cyan.400)',
      }
    },
  },
  plugins: [],
}; 