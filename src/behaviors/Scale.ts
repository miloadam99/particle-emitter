import { Particle } from '../Particle';
import { PropertyList } from '../PropertyList';
import { PropertyNode, ValueList } from '../PropertyNode';
import { IEmitterBehavior, BehaviorOrder } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';

/**
 * A Scale behavior that applies an interpolated or stepped list of values to the particle's x & y scale.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'scale',
 *     config: {
 *          scale: {
 *              list: [{value: 0, time: 0}, {value: 1, time: 0.25}, {value: 0, time: 1}],
 *              isStepped: true
 *          },
 *          minMult: 0.5
 *     }
 * }
 * ```
 */
export class ScaleBehavior implements IEmitterBehavior
{
    public static type = 'scale';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private list: PropertyList<number>;
    private minMult: number;
    constructor(config: {
        /**
         * Scale of the particles, with a minimum value of 0
         */
        scale: ValueList<number>;
        /**
         * A value between minimum scale multipler and 1 is randomly
         * generated and multiplied with each scale value to provide the actual scale for each particle.
         */
        minMult: number;
    })
    {
        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.scale));
        this.minMult = config.minMult ?? 1;
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;

            next.config.scaleMult = mult;
            next.scale.x = next.scale.y = this.list.first.value * mult;

            next = next.next;
        }
    }

    updateParticle(particle: Particle): void
    {
        particle.scale.x = particle.scale.y = this.list.interpolate(particle.agePercent) * particle.config.scaleMult;
    }
}

/**
 * A Scale behavior that applies a randomly picked value to the particle's x & y scale at initialization.
 *
 * Example config:
 * ```javascript
 * {
 *     type: 'scaleStatic',
 *     config: {
 *         min: 0.25,
 *         max: 0.75,
 *     }
 * }
 * ```
 */
export class StaticScaleBehavior implements IEmitterBehavior
{
    public static type = 'scaleStatic';
    public static editorConfig: BehaviorEditorConfig = null;

    public order = BehaviorOrder.Normal;
    private scale : PropertyList<number>;
    public min: number;
    public max: number;
    public scaleDuration: number;
    public isSpawnFullyScaled: boolean;

    constructor(config: {
            min: number,
            max: number,
            scaleDuration: number,
            isSpawnFullyScaled: boolean
        })
    {
        this.min = config.min;
        this.max = config.max;
        this.scaleDuration = config.scaleDuration;
        this.isSpawnFullyScaled = config.isSpawnFullyScaled;

        this.scale = new PropertyList(false);
        this.scale.reset(PropertyNode.createList({
            list: [
                {
                    value: 0,
                    time: 0
                },
                {
                    value: 1,
                    time: this.scaleDuration
                },
            ],
            isStepped: false
        }));
    }

    initParticles(first: Particle): void
    {
        let next = first;

        while (next)
        {
            const finalScale = (Math.random() * (this.max - this.min)) + this.min;

            if (this.isSpawnFullyScaled)
            {
                next.scale.x = next.scale.y = finalScale;
            }
            else
            {
                next.scale.x = next.scale.y = 0;
                next.config.finalScale = finalScale;
            }

            next = next.next;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateParticle(particle: Particle, deltaSec: number): void
    {
        if (!this.isSpawnFullyScaled && particle.age < this.scaleDuration)
        {
            const mult = this.scale.interpolate(particle.age / this.scaleDuration);

            particle.scale.x = particle.scale.y = particle.config.finalScale * mult;
        }
    }
}
