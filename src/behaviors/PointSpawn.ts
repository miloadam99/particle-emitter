import { Particle } from '../Particle';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';
import { randomIntBetween } from "../ParticleUtils";

/**
 * A Spawn behavior that sends particles out from a single point at the emitter's position.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'spawnPoint',
 *     config: {}
 * }
 * ```
 */
export class PointSpawnBehavior implements IEmitterBehavior
{
    public static type = 'spawnPoint';
    public static editorConfig: BehaviorEditorConfig = null;

    order = BehaviorOrder.Spawn;
    public minX : number;
    public maxX : number;
    public minY : number;
    public maxY : number;
    constructor(config: {
        minX : number,
        maxX : number,

        minY : number,
        maxY : number
    }) {
        this.minX = config.minX;
        this.maxX = config.maxX;
        this.minY = config.minY;
        this.maxY = config.maxY;
    }

    initParticles(first: Particle): void
    {
        first.x = randomIntBetween(this.minX, this.maxX);
        first.y = randomIntBetween(this.minY, this.maxY);
    }
}
