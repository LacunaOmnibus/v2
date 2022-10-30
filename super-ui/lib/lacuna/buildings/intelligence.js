import Building from '../building';

class Intelligence extends Building {
  constructor() {
    super('intelligence');

    this.apiMethods('intelligence', [
      'view',
      'train_spy',
      'view_spies',
      'view_all_spies',
      'subsidize_training',
      'burn_spy',
      'name_spy',
      'assign_spy',
    ]);
  }
}

export default Intelligence;
