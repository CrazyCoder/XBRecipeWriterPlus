export const POUR_PATTERN = {
    CENTERED: 0,
    CIRCULAR: 1,
    SPIRAL: 2
}

export const AGITATION = {
    ALL_OFF: 0,
    BEFORE_ON_AFTER_OFF: 1,
    BEFORE_OFF_AFTER_ON: 2,
    BEFORE_ON_AFTER_ON: 3
}

class Pour {
    public pourNumber: number = -1;
    public volume: number = -1;
    public temperature: number = -1;
    public flowRate: number = -1;
    public agitation: number = -1;
    public pourPattern: number = -1;
    public pauseTime: number = -1;


    constructor(
        pourNumber: number,
        volume?: number,
        temperature?: number,
        flowRate?: number,
        agitation?: number,
        pourPattern?: number,
        pauseTime?: number
    ) {
        this.pourNumber = pourNumber;
        this.volume = volume ?? this.volume;
        this.temperature = temperature ?? this.temperature;
        this.flowRate = flowRate ?? this.flowRate;
        this.agitation = agitation ?? this.agitation;
        this.pourPattern = pourPattern ?? this.pourPattern;
        this.pauseTime = pauseTime ?? this.pauseTime;
    }


    public getPourNumber(): number {
        return this.pourNumber;
    }

    public setPourNumber(pourNumber: number): void {
        this.pourNumber = pourNumber;
    }

    public getVolume(): number {
        return this.volume;
    }

    public setVolume(volume: number): void {
        this.volume = volume;
    }

    public getTemperature(): number {
        return this.temperature;
    }

    public setTemperature(temperature: number): void {
        this.temperature = temperature;
    }

    public getFlowRate(): number {
        return this.flowRate;
    }

    public setFlowRate(flowRate: number): void {
        this.flowRate = flowRate;
    }

    public getAgitation(): number {
        return this.agitation;
    }

    public setAgitation(agitation: number): void {
        this.agitation = agitation;
    }

    public getAgitationBefore(): boolean {
        return (this.agitation & 0b01) > 0;
    }

    public getAgitationAfter(): boolean {
        return (this.agitation & 0b10) > 0;
    }

    public setAgitationBefore(agitationBefore: boolean): void {
        if (agitationBefore) {
            this.agitation |= 0b01;
        } else {
            this.agitation &= 0b10;
        }
    }

    public setAgitationAfter(agitationAfter: boolean): void {

        if (agitationAfter) {
            this.agitation |= 0b10;
        } else {
            this.agitation &= 0b01;
        }
    }

    public getPourPattern(): number {
        return this.pourPattern;
    }

    public setPourPattern(pourPattern: number): void {
        this.pourPattern = pourPattern;
    }

    public getPauseTime(): number {
        return this.pauseTime;
    }

    public setPauseTime(pauseTime: number): void {
        this.pauseTime = pauseTime;
    }

    public toJSON(): string {
        return JSON.stringify({
            pourNumber: this.pourNumber,
            volume: this.volume,
            temperature: this.temperature,
            flowRate: this.flowRate,
            agitation: this.agitation,
            pourPattern: this.pourPattern,
            pauseTime: this.pauseTime
        });
    }

    private getAgitationText(): string {
        switch (this.agitation) {
            case AGITATION.ALL_OFF:
                return "Agitation Before Off/Agitation After Off"
            case AGITATION.BEFORE_ON_AFTER_OFF:
                return "Agitation Before On/Agitation After Off"
            case AGITATION.BEFORE_OFF_AFTER_ON:
                return "Agitation Before Off/Agitation After On"
            case AGITATION.BEFORE_ON_AFTER_ON:
                return "Agitation Before On/Agitation After On"
            default:
                return "Error"
        }
    }

    private getPourPatternText(): string {
        return Pour.getPourPatternText(this.pourPattern);
    }

    public static getPourPatternText(pattern: number) {
        switch (pattern) {
            case POUR_PATTERN.CENTERED:
                return "Centered"
            case POUR_PATTERN.CIRCULAR:
                return "Circular"
            case POUR_PATTERN.SPIRAL:
                return "Spiral"
            default:
                return "Error"
        }
    }

    public toString(): string {
        return `Pour {
            pourNumber: ${this.pourNumber},
            volume: ${this.volume},
            temperature: ${this.temperature},
            flowRate: ${this.flowRate},
            agitation: ${this.getAgitationText()},
            pourPattern: ${this.getPourPatternText()},
            pauseTime: ${this.pauseTime}
        }`;
    }
}

export default Pour;
