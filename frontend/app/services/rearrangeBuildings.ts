import lacuna from 'app/lacuna';
import _ from 'lodash';
import { Matrix } from 'app/interfaces/rearrangeBuildings';
import { int } from 'app/util';
import {
  BodyGetBuildingsResponse,
  BodyRearrangeBuildingsParams,
  BodyRearrangeBuildingsResponse,
} from 'app/interfaces';

class RearrangeBuildingsService {
  async fetchBuildingsMatrix(bodyId: number): Promise<Matrix> {
    const res = await lacuna.body.getBuildings({ body_id: bodyId });
    return this.buildingsToMatrix(res.buildings);
  }

  buildingsToMatrix(buildings: BodyGetBuildingsResponse['buildings']): Matrix {
    const matrix: Matrix = [];

    _.each(buildings, (building, id) => {
      matrix[building.x] = matrix[building.x] || [];
      matrix[building.x][building.y] = { id: int(id), ...building };
    });

    return matrix;
  }

  rearrangeBuildingsFromMatrix(
    bodyId: number,
    matrix: Matrix
  ): Promise<BodyRearrangeBuildingsResponse> {
    return lacuna.body.rearrangeBuildings({
      body_id: bodyId,
      arrangement: this.matrixToRearrangeCall(matrix),
    });
  }

  matrixToRearrangeCall(matrix: Matrix): BodyRearrangeBuildingsParams['1'] {
    const buildings: BodyRearrangeBuildingsParams['1'] = [];

    for (let x = -5; x <= 5; x++) {
      if (!matrix[x]) continue;
      for (let y = -5; y <= 5; y++) {
        const b = matrix[x][y];
        if (!b) continue;
        buildings.push({ x: b.x, y: b.y, id: b.id });
      }
    }

    return buildings;
  }
}

export default new RearrangeBuildingsService();
