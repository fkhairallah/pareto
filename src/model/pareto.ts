export default class sim {
    public numberOfPlayers: number;
    public initialCapital: number;
    public currentNetWorth: number[] = [];
    public players: number[] = [];
    public iteration: number;
    public numberBankrupt: number;
    public richest: number;
    public poorest: number;
    public bankruptLevel: number=0;
    public poorLevel: number=0;
    public middleLevel: number=0;
    public upperLevel: number=0;

    // socialism
    public taxTheRich: Boolean;
    public richTaxPercentage: number = 30;
    public giveWelfare: Boolean
    public welfarePercentage: number = 20;

    // capitalism
    public increaseMotivation: Boolean;
    public motivationPercentage: number = 5;

    public isPoor(player: number): Boolean {
        return this.currentNetWorth[player] <= (this.poorLevel);
    }
    isLowerMiddleClass(player: number): Boolean {
        return ((this.currentNetWorth[player] > this.poorLevel) && (this.currentNetWorth[player] <= this.middleLevel))
    }
    isMiddleClass(player: number): Boolean {
        return ((this.currentNetWorth[player] > this.middleLevel) && (this.currentNetWorth[player] <= this.upperLevel))
    }
    public isUpperClass(player: number): Boolean {
        return (this.currentNetWorth[player] > this.upperLevel)
    }



    constructor(players: number, capital: number) {
        this.numberOfPlayers = players;
        this.initialCapital = capital;
        this.richest = capital;
        this.poorest = capital;
        this.taxTheRich = false;
        this.giveWelfare = false;
        this.increaseMotivation = false;
        this.currentNetWorth = Array(this.numberOfPlayers);
        for (var i: number = 0; i < this.numberOfPlayers; i++) {
            this.players[i] = i+1;
            this.currentNetWorth[i] = this.initialCapital;
        }
        this.iteration = 0;
        this.numberBankrupt = 0;
        this.richest = this.initialCapital;

        this.resetLevels();

    }
    public abSilverSpoon(ratio:number)
    {
        for (var i: number = 0; i < this.numberOfPlayers; i++) {
            this.players[i] = i+1;
            this.currentNetWorth[i] = this.initialCapital;
            if (i<(this.numberOfPlayers/2)) this.currentNetWorth[i] /= ratio;
        }

    }

    public resetLevels(): void {
        this.bankruptLevel = this.initialCapital * 0.1;
        this.poorLevel = this.initialCapital * 0.2;
        this.middleLevel = this.initialCapital * 0.4;
        this.upperLevel = this.initialCapital * 0.8;

    }

    public run(n: number) {
        var i: number;
        var j: number;

        for (i = 0; i < n; i++) {
            // do nothing unless there is at least 2 players
            if ((this.numberOfPlayers - this.numberBankrupt) < 3) return;

            do {
                var player1: number = (Math.floor(Math.random() * (this.numberOfPlayers)));

            }
            while (this.currentNetWorth[player1] <= this.bankruptLevel);

            do {
                var player2: number = (Math.floor(Math.random() * (this.numberOfPlayers)));

            }
            //				while (player1 == player2);
            while ((this.currentNetWorth[player2] <= this.bankruptLevel) || (player1 == player2));

            var chance: number = Math.random();
            if (this.increaseMotivation)	// increase the motivation of lower middle class and poor
            {
                if (this.isLowerMiddleClass(player1)) chance += this.motivationPercentage / 100.0;
                if (this.isLowerMiddleClass(player2)) chance -= this.motivationPercentage / 100.0;
                if (this.isPoor(player1)) chance += this.motivationPercentage * 1.5 / 100.0;
                if (this.isPoor(player2)) chance -= this.motivationPercentage * 1.5 / 100.0;
            }
            var kitty: number = ((Math.floor(chance * 10)) > 5) ? 1 : -1;

            this.currentNetWorth[player1] += kitty;
            this.currentNetWorth[player2] -= kitty;

            if (this.giveWelfare)	// give welfare to anyone that drops below the poverty line
            {
                for (j = 0; j < this.numberOfPlayers; j++)
                    if (this.currentNetWorth[j] < this.bankruptLevel)
                        this.currentNetWorth[j] += 1;
            }

            this.iteration++;

            this.numberBankrupt = 0;
            for (j = 0; j < this.numberOfPlayers; j++) {
                if (this.currentNetWorth[j] <= this.bankruptLevel) this.numberBankrupt++;
                if (this.currentNetWorth[j] > this.richest) this.richest = this.currentNetWorth[j];
                if (this.currentNetWorth[j] < this.poorest) this.poorest = this.currentNetWorth[j];
            }

        }

    }

    public stat(): String {
        
        return "[#" + this.iteration + "] " 
            + this.numberBankrupt + " bankrupt. Inequality ratio " 
            + (this.richest / this.poorest).toFixed(0);
    }
}
