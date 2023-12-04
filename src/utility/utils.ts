export const genRamdomRoomId = () => {
  const randomNumber = Math.floor(Math.random() * 10000);
  return randomNumber.toString().padStart(4, '0');
};
export const getFromCharCode= (index: number) => {
  return String.fromCharCode(65 + index)
}