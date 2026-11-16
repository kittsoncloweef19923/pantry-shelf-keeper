/**
 * The only image names the asset pipeline produces. Never invent another one.
 */
export const assets = {
  bg: require('../../assets/bg_game.png'),
  logo: require('../../assets/logo.png'),
  iconHome: require('../../assets/icon_home.png'),
  iconPause: require('../../assets/icon_pause.png'),
  jar: require('../../assets/sprite_1.png'),
  dated: require('../../assets/sprite_2.png'),
  bag: require('../../assets/sprite_3.png'),
  herb: require('../../assets/sprite_4.png'),
  shelf: require('../../assets/sprite_5.png'),
  buttonRect: require('../../assets/button_rect.png'),
  buttonRound: require('../../assets/button_round.png'),
};

export type AssetKey = keyof typeof assets;
