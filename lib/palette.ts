// Single source of truth for the brand colors used inside WebGL.
// Keep in sync with the @theme block in app/globals.css.
export const palette = {
  cobalt: "#073F92", // brand blue, sampled from the official logo file
  cobaltDeep: "#052C68", // darker shade of the brand blue for depth
  cream: "#F7F2E9", // brand cream
  sand: "#E6DAC4", // darker shade of the cream for borders / shadows
  vanilla: "#E8D7B0", // milk colour, matched to the product photo
  chocolate: "#5B3A29",
  strawberry: "#E8959A", // strawberry milk, matched to the team's product photo
  strawberryInk: "#C2475A", // darker strawberry for text and buttons on cream
  cap: "#13204A", // navy bottle cap
} as const;
