export enum ShipSize {
  SUBWAY = 2,
  DESTROYER = 3,
  CRUISER = 4,
  BATTLESHIP = 5
}
export enum Direction {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL"
}
export enum RoomStatus {
  "PREPARE" = "PREPARE", // 房間剛建立等待對手玩家加入
  "READY" = "READY", // 房間已有兩位玩家，等待玩家準備
  "PLAYING" = "PLAYING" // 戰鬥中
}
export enum PlayerStatus {
  "PREPARE" = "PREPARE", // 玩家準備中(選擇船艦)
  "READY" = "READY", // 玩家準備完成，等待對手準備
  "PLAYING" = "PLAYING" // 玩家戰鬥中
}