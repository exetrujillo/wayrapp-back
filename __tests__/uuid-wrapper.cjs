// __tests__/uuid-wrapper.cjs
// Wrapper CommonJS para uuid que funciona con Jest

// Implementación simple de v4 UUID que funciona en CommonJS
function v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Exporta tanto como default export como named export para compatibilidad
module.exports = {
  v4: v4,
  default: {
    v4: v4,
  },
};

// También exporta v4 directamente para destructuring
module.exports.v4 = v4;
