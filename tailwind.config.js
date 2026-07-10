/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        "quicksand-light": ["Quicksand-Light"],
        "quicksand-regular": ["Quicksand-Regular"],
        "quicksand-medium": ["Quicksand-Medium"],
        "quicksand-semibold": ["Quicksand-SemiBold"],
        "quicksand-bold": ["Quicksand-Bold"],
        "fredoka-light": ["Fredoka-Light"],
        fredoka: ["Fredoka-Regular"],
        "fredoka-regular": ["Fredoka-Regular"],
        "fredoka-medium": ["Fredoka-Medium"],
        "fredoka-semibold": ["Fredoka-SemiBold"],
        "fredoka-bold": ["Fredoka-Bold"],
        "fredoka-one": ["FredokaOne-Regular"],
      },
    },
  },
  plugins: [],
}

