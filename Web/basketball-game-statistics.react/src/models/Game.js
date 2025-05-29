export default class Game {
  constructor({
    id,
    clubId,
    club,
    gameDescription = '',
    venue = '',
    matchDate = null,
    createDate = null,
    createBy = null,
    isActive = false,
    instruction = '',
    playerStatistics = []
  }) {
    this.id = id;
    this.clubId = clubId;
    this.club = club;
    this.gameDescription = gameDescription;
    this.venue = venue;
    this.matchDate = matchDate ? new Date(matchDate) : null;
    this.createDate = createDate ? new Date(createDate) : null;
    this.createBy = createBy;
    this.isActive = isActive;
    this.instruction = instruction;
    this.playerStatistics = playerStatistics;
  }
} 