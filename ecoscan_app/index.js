if (__DEV__) {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("expo-notifications"))
      return;
    originalError(...args);
  };

  console.warn = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("expo-notifications"))
      return;
    originalWarn(...args);
  };
}

require("expo-router/entry");
