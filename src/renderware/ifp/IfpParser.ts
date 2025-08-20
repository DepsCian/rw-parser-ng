import { RwFile } from '../RwFile';
import { IfpVersion, RwIfp, RwIfpAnimation, RwIfpBone, RwIfpKeyframe } from './IfpData';

export class IfpParser extends RwFile
{
    constructor(buffer: Buffer) {
        super(buffer);
    }

    public parse(): RwIfp {
        const fileSignature = this.readString(4);
        this.setPosition(0);

        let version: IfpVersion;
        if (fileSignature === 'ANP3') {
            version = IfpVersion.ANP3;
            return this.readAnp3();
        } else if (fileSignature === 'ANPK') {
            version = IfpVersion.ANPK;
            return this.readAnpk();
        } else {
            version = IfpVersion.UNSUPPORTED;
            throw new Error('Unsupported IFP version');
        }
    }

    private readAnp3(): RwIfp {
        this.skip(4); // ANP3
        const size = this.readUint32();
        const name = this.readString(24);
        const animationsCount = this.readUint32();
        const animations: RwIfpAnimation[] = [];

        for (let i = 0; i < animationsCount; i++) {
            animations.push(this.readAnp3Animation());
        }

        return {
            version: IfpVersion.ANP3,
            name,
            animations
        };
    }

    private readAnp3Animation(): RwIfpAnimation {
        const name = this.readString(24);
        const bonesCount = this.readUint32();
        this.skip(4); // keyframes_size
        this.skip(4); // unk
        const bones: RwIfpBone[] = [];

        for (let i = 0; i < bonesCount; i++) {
            bones.push(this.readAnp3Bone());
        }

        return { name, bones };
    }

    private readAnp3Bone(): RwIfpBone {
        const name = this.readString(24);
        const keyframeTypeNum = this.readUint32();
        const keyframesCount = this.readUint32();
        const keyframeType = keyframeTypeNum === 4 ? 'KRT0' : 'KR00';
        const boneId = this.readInt32();
        const keyframes: RwIfpKeyframe[] = [];

        for (let i = 0; i < keyframesCount; i++) {
            const qx = this.readInt16() / 4096.0;
            const qy = this.readInt16() / 4096.0;
            const qz = this.readInt16() / 4096.0;
            const qw = this.readInt16() / 4096.0;
            const time = this.readInt16();

            let px = 0, py = 0, pz = 0;
            if (keyframeType[2] === 'T') {
                px = this.readInt16() / 1024.0;
                py = this.readInt16() / 1024.0;
                pz = this.readInt16() / 1024.0;
            }
            
            keyframes.push({
                time,
                position: { x: px, y: py, z: pz },
                rotation: { w: qw, x: qx, y: qy, z: qz },
                scale: { x: 1, y: 1, z: 1 }
            });
        }

        return {
            name,
            keyframeType,
            useBoneId: true,
            boneId,
            keyframes
        };
    }

    private readAnpk(): RwIfp {
        this.skip(4); // ANPK
        const size = this.readUint32();
        this.skip(4); // INFO
        const infoLen = this.readUint32();
        const animationsCount = this.readUint32();
        const name = this.readString(infoLen - 4);
        const nameAlignLen = (4 - infoLen % 4) % 4;
        this.skip(nameAlignLen);

        const animations: RwIfpAnimation[] = [];
        for (let i = 0; i < animationsCount; i++) {
            animations.push(this.readAnpkAnimation());
        }

        return {
            version: IfpVersion.ANPK,
            name,
            animations
        };
    }

    private readAnpkAnimation(): RwIfpAnimation {
        this.skip(4); // NAME
        const nameLen = this.readUint32();
        const name = this.readString(nameLen);
        this.skip((4 - nameLen % 4) % 4);
        this.skip(4); // DGAN
        this.skip(4); // animation_size
        this.skip(4); // INFO
        this.skip(4); // unk_size
        const bonesCount = this.readUint32();
        this.skip(4); // unk
        
        const bones: RwIfpBone[] = [];
        for (let i = 0; i < bonesCount; i++) {
            bones.push(this.readAnpkBone());
        }

        return { name, bones };
    }

    private readAnpkBone(): RwIfpBone {
        this.skip(4); // CPAN
        this.skip(4); // bone_len
        this.skip(4); // ANIM
        const animLen = this.readUint32();
        const name = this.readString(28);
        const keyframesCount = this.readUint32();
        this.skip(8); // unk

        let boneId = 0;
        const useBoneId = animLen === 44;
        if (useBoneId) {
            boneId = this.readInt32();
        } else {
            this.skip(8); // sibling_x, sibling_y
        }

        let keyframeType = 'K000';
        const keyframes: RwIfpKeyframe[] = [];

        if (keyframesCount > 0) {
            keyframeType = this.readString(4);
            this.skip(4); // keyframes_len

            for (let i = 0; i < keyframesCount; i++) {
                const qx = this.readFloat();
                const qy = this.readFloat();
                const qz = this.readFloat();
                const qw = this.readFloat();

                let px = 0, py = 0, pz = 0;
                if (keyframeType[2] === 'T') {
                    px = this.readFloat();
                    py = this.readFloat();
                    pz = this.readFloat();
                }

                let sx = 1, sy = 1, sz = 1;
                if (keyframeType[3] === 'S') {
                    sx = this.readFloat();
                    sy = this.readFloat();
                    sz = this.readFloat();
                }

                const time = this.readFloat();

                keyframes.push({
                    time,
                    position: { x: px, y: py, z: pz },
                    rotation: { w: qw, x: qx, y: qy, z: qz },
                    scale: { x: sx, y: sy, z: sz }
                });
            }
        }

        return {
            name,
            keyframeType,
            useBoneId,
            boneId,
            keyframes
        };
    }
}