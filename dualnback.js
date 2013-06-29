game = {
    n:1,
    cells:[],
    audio:['a', 'd', 'f', 'h', 'i', 'j', 'l', 'm', 'o'],

    memory:[],
    flashDelay:500,
    delay:3000,
    task:-1,
    length:24,
    current:0,
    guessedPos:false,
    guessedAud:false,
    debug:true,

    audio_result:{
        correct:0,
        incorrect:0,
        missed:0
    },
    position_result:{
        correct:0,
        incorrect:0,
        missed:0
    },

    doDebug:function () {
        var dc = document.getElementById('gamedebug');
        if (dc == null)
            return;
        dc.style.display = 'table';
        while (dc.firstChild)
            dc.removeChild(dc.firstChild);
        // Create headers...
        dc.innerHTML += "<tr><th>Offset</th><th>X</th><th>Y</th><th>Audio</th></tr>";

        // Print memory
        for (var i = 0; i < this.memory.length; i++) {
            var s = "<tr>";
            var mem = this.memory[i];
            s += "<td> N - " + (this.memory.length - i - 1) + "</td>";
            s += "<td>" + mem.x + "</td>";
            s += "<td>" + mem.y + "</td>";
            s += "<td>" + mem.letter + "</td>";
            s += "</tr>";
            dc.innerHTML += s;
        }

        // Print scores...
        var ar = this.audio_result;
        var pr = this.position_result;
        dc.innerHTML += "<tr><td colspan='4'>Audio &nbsp;&nbsp;&nbsp;(C/I/M): " + ar.correct + "/" + ar.incorrect + "/" + ar.missed + "</td></tr>";
        dc.innerHTML += "<tr><td colspan='4'>Position (C/I/M): " + pr.correct + "/" + pr.incorrect + "/" + pr.missed + "</td></tr>";

        if(this.isAudioMatch() === true) {
            dc.innerHTML += "<tr><td colspan='4' class='gamematchfeedback'>Audio match</td></tr>";
        }
        if(this.isPositionMatch() === true) {
            dc.innerHTML += "<tr><td colspan='4' class='gamematchfeedback'>Position match</td></tr>";
        }
    },

    // does the audio match?
    isAudioMatch:function () {
        if (this.memory.length < this.n + 1)
            return 'Not enough data';
        return this.memory[0].letter == this.memory[this.memory.length - 1].letter;
    },

    // Check for audio match, increment scores, modify feedback etc.
    checkAudioMatch:function () {
        if (this.guessedAud)
            return;
        var res = this.isAudioMatch();
        var fb = document.getElementById('gameaudiofeedback');
        if (res === true) {
            fb.style.color = 'lime';
            this.audio_result.correct++;
        } else if (res === false) {
            fb.style.color = 'red';
            this.audio.result.incorrect++;
        }

        this.guessedAud = true;
    },

    // does the position match?
    isPositionMatch:function () {
        if (this.memory.length < this.n + 1)
            return 'Not enough data';
        var cur = this.memory[this.memory.length - 1];
        var n = this.memory[0];
        return cur.x == n.x && cur.y == n.y;
    },

    // Does the position match?
    checkPositionMatch:function () {
        if (this.guessedPos)
            return;

        var res = this.isPositionMatch();

        var fb = document.getElementById('gamepositionfeedback');

        if (res === true) {
            fb.style.color = 'lime';
            this.position_result.correct++;
        } else if (res === false) {
            fb.style.color = 'red';
            this.position_result.incorrect++;
        }

        this.guessedPos = true;
    },

    // Handle key presses
    onkeypress:function (evt) {
        evt = evt || window.event;
        var charCode = evt.keyCode || evt.which;
        var charStr = String.fromCharCode(charCode);

        if (charStr == 'p') {
            // Todo: pause
        } else if (charStr == 'l') { // Audio...
            game.checkPositionMatch();
        } else if (charStr == 'a') { // Position...
            game.checkAudioMatch();
        }
    },

    // start the game
    start:function () {
        this.current = 0; // Reset some stuff...
        this.memory = [];
        this.audio_result.correct = this.audio_result.incorrect = this.audio_result.missed = 0;
        this.position_result.correct = this.position_result.incorrect = this.position_result.missed = 0;
        document.getElementById('nselect').disabled = true;
        var fb = document.getElementById('gamefeedback');
        fb.style.display = 'block';

        for (var x = 0; x < 3; x++) {
            this.cells[x] = [];
            for (var y = 0; y < 3; y++) {
                this.cells[x][y] = document.getElementById('cell' + x.toString() + y.toString());
            }
        }

        this.next();
    },

    // Stop the game
    stop:function () {
        document.getElementById('nselect').disabled = false;
        document.getElementById('gamefeedback').style.display = 'none';
        clearTimeout(this.task);
    },

    // Unhighlight the last highlighted cell
    unhighlightCell:function () {
        if (this.memory.length < 1)
            return;
        var cell = this.memory[this.memory.length - 1].cell;
        var marker = document.getElementById('gamemarker');
        cell.removeChild(marker);
    },

    // Highlight a cell
    highlightCell:function (x, y) {
        var cell = this.cells[x][y];
        var element = document.createElement("div");
        element.id = "gamemarker";
        cell.appendChild(element);
    },

    // Next iteration
    next:function () {
        if (!this.guessedAud && this.isAudioMatch() === true)
            this.audio_result.missed++;
        if (!this.guessedPos && this.isPositionMatch() === true)
            this.position_result.missed++;
        this.guessedAud = false;
        this.guessedPos = false;
        document.getElementById('gameaudiofeedback').style.color = 'black';
        document.getElementById('gamepositionfeedback').style.color = 'black';
        var x = Math.floor(Math.random() * 3);
        var y = Math.floor(Math.random() * 3);
        var letter = this.audio[Math.floor(Math.random() * this.audio.length)];
        speak(letter);
        this.highlightCell(x, y);


        this.memory.push({
            cell:this.cells[x][y],
            x:x,
            y:y,
            letter:letter
        });

        if (this.memory.length > this.n + 1)
            this.memory.shift();

        setTimeout('game.unhighlightCell()', this.flashDelay);
        this.task = setTimeout('game.next()', this.delay);
        if(this.debug)
        this.doDebug();
    }
};

function gamebtnclick(e) {
    if (e.innerHTML == 'Start') {
        e.innerHTML = 'Stop';
        game.start();
    } else {
        e.innerHTML = 'Start';
        game.stop();
    }
}

// N value selected...
function nselected(e) {
    game.n = e.selectedIndex + 1;
}

document.onkeypress = game.onkeypress;