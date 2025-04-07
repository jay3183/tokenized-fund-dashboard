function getUserFromToken(token) {
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return decoded;
  } catch (e) {
    return null;
  }
}

export { getUserFromToken }; 