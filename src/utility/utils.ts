export const genRamdomRoomId = () => {
  const randomNumber = Math.floor(Math.random() * 10000);
  return randomNumber.toString().padStart(4, '0');
};
export const getFromCharCode= (index: number) => {
  return String.fromCharCode(65 + index)
}
const getASCII = (index: number) => 65 + index;
export const getCoordinates = (grid_size: number, cellIndex: number) => {
  const xCoordinate = (cellIndex % grid_size).toString();
  const yCoordinate = String.fromCharCode(getASCII(Math.floor(cellIndex / grid_size)));
  return [xCoordinate, yCoordinate];
};