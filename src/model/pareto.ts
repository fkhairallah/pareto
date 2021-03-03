import Player from './Player';

export default class sim {
    public players: Player[] = [];

    // public numberOfPlayers: number;
    public initialCapital: number=0;
    public iteration: number=0;
    public finished: boolean = true;

    //statuses
    public numberBankrupt: number=0;
    public richest: number=0;
    public poorest: number=0;
    public bankruptLevel: number=0;
    public poorLevel: number=0;
    public middleLevel: number=0;
    public upperLevel: number=0;

    // socialism
    public taxTheRich: Boolean=false;
    public richTaxPercentage: number = 30;
    public giveWelfare: Boolean = false;
    public welfarePercentage: number = 20;

    // // capitalism
    // public increaseMotivation: Boolean= false;
    // public motivationPercentage: number = 5;

    public isPoor(player: number): Boolean {
        return this.players[player].netWorth <= (this.poorLevel);
    }
    isLowerMiddleClass(player: number): Boolean {
        return ((this.players[player].netWorth > this.poorLevel) && (this.players[player].netWorth <= this.middleLevel))
    }
    isMiddleClass(player: number): Boolean {
        return ((this.players[player].netWorth > this.middleLevel) && (this.players[player].netWorth <= this.upperLevel))
    }
    public isUpperClass(player: number): Boolean {
        return (this.players[player].netWorth > this.upperLevel)
    }



    constructor() { }

    public configureSimulation(capital:number=20)
    {
        this.players = [];
        this.initialCapital = capital;
        this.richest = capital;
        this.poorest = capital;
        this.taxTheRich = false;
        this.giveWelfare = false;
        //this.increaseMotivation = false;
        this.iteration = 0;
        this.numberBankrupt = 0;
        this.richest = this.initialCapital;
        this.poorest = this.initialCapital;

        this.bankruptLevel = this.initialCapital * 0.1;
        this.poorLevel = this.initialCapital * 0.2;
        this.middleLevel = this.initialCapital * 0.4;
        this.upperLevel = this.initialCapital * 0.8;

        this.finished = false;

    }


    public configurePlayers(numberOfPlayers:number, samplePlayer:Player)
    {
        var newPlayer: Player = new Player;

        for (var i=0;i<numberOfPlayers;i++)
        {
            newPlayer = Object.assign({},samplePlayer);
            newPlayer.name += i.toString();
            newPlayer.netWorth = this.initialCapital * newPlayer.silverSpoonRatio;
            this.players.push(newPlayer);
        }

        // set richest & poorest levels
        if (this.richest < newPlayer.netWorth) this.richest = newPlayer.netWorth;
        if (this.poorest > newPlayer.netWorth) this.poorest = newPlayer.netWorth;
    }


    public run(n: number) {
        var i: number;
        var j: number;

        for (i = 0; i < n; i++) {
            // do nothing unless there is at least 2 players
            if ((this.players.length - this.numberBankrupt) <= 3){
                this.finished = true;
                return;
            } 

            // Pick a non-bankrupt player at random
            do {
                var player1: number = (Math.floor(Math.random() * (this.players.length)));

            }
            while (this.players[player1].netWorth <= this.bankruptLevel);

            // Pick a second player
            do {
                var player2: number = (Math.floor(Math.random() * (this.players.length)));

            }
            //				while (player1 == player2);
            while ((this.players[player2].netWorth <= this.bankruptLevel) || (player1 == player2));

            // play them against each other: random # and then adjust by 5% for motivation
            var chance1: number = Math.random() + (5/100 * this.players[player1].motivationFactor);
            var chance2: number = Math.random() + (5/100 * this.players[player2].motivationFactor);
            if (chance1>chance2) 
            {
                this.players[player1].netWorth++;
                this.players[player2].netWorth--;
            }
            else
            {
                this.players[player1].netWorth--;
                this.players[player2].netWorth++;
            }

            if (this.giveWelfare)	// give welfare to anyone that drops below the poverty line
            {
                for (j = 0; j < this.players.length; j++)
                    if (this.players[j].netWorth < this.bankruptLevel)
                        this.players[j].netWorth += 1;
            }

            this.iteration++;

            this.numberBankrupt = 0;
            for (j = 0; j < this.players.length; j++) {
                if (this.players[j].netWorth <= this.bankruptLevel) this.numberBankrupt++;
                if (this.players[j].netWorth > this.richest) this.richest = this.players[j].netWorth;
                if (this.players[j].netWorth < this.poorest) this.poorest = this.players[j].netWorth;
            }

        }

    }

    public stat(): String {

        if (this.players.length == 0) return "";
        else
        
        return "[#" + this.iteration + "] " 
            + this.numberBankrupt + " bankrupt. Inequality ratio " 
            + (this.richest / this.poorest).toFixed(0);
    }
}
