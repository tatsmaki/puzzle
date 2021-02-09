const Puzzle = {
    elements: {
        menu: null,
        turn: null,
        time: null,
        pause: null,
        game: null,
        puzz: [],
        open: null,
        list: [],
        startNewGame: null,
        select: null,
        sound: [],
        score: []
    }, 
    properties: {
        end: 15,
        line: 4,
        time: 0,
        interval: 0,
        play: false,
        solve: false,
        speed: 250,
        random: true,
        target: 0,
        animation: 0
    },
    moves: {
        step: []
    },

    init() {
        const soundsCount = 7;
        if (localStorage.getItem('score')) {
            this.elements.score = JSON.parse(localStorage.getItem('score'));
        }
        for (let i = 1; i < soundsCount; i += 1) {
            const sound = document.createElement("audio");
            sound.src = `assets/bip${i}.mp3`;
            this.elements.sound.push(sound);
        }
        this.elements.menu = document.createElement("div");
        this.elements.menu.classList.add("menu");
        this.elements.turn = document.createElement("div");
        this.elements.turn.textContent = 'turn 0';
        this.elements.turn.classList.add("turn");
        this.elements.menu.appendChild(this.elements.turn);
        this.elements.time = document.createElement("div");
        this.elements.time.textContent = "time 00:00";
        this.elements.time.classList.add("time");
        this.elements.menu.appendChild(this.elements.time);
        this.elements.pause = document.createElement("button");
        this.elements.pause.innerHTML = "<i class='material-icons'>pause</i>";
        this.elements.pause.classList.add("pause");
        this.elements.menu.appendChild(this.elements.pause);
        this.elements.open = document.createElement("div");
        this.elements.open.classList.add("open");
        this.elements.open.appendChild(this.optionsList());
        this.elements.pause.addEventListener('click', () => {
            this.openPauseMenu();
        });
        document.body.appendChild(this.elements.menu);
        this.elements.game = document.createElement("div");
        this.elements.game.classList.add("game");
        this.elements.game.appendChild(this.start());
        this.properties.numbers = true;
        this.numbersOption(this.elements.list[5]);
        this.randomMix();
        document.body.appendChild(this.elements.game);
        window.addEventListener('resize', this.redraw);
    },

    redraw () {
        let line = Puzzle.properties.line;
        const scaling = Number(window.getComputedStyle(document.querySelector('.game')).width.replace('px',''));
        let X = 0; let Y = 0;
        Puzzle.elements.puzz.forEach( puzzleItem => {
            X = Number(puzzleItem.textContent)-1;
            Y = Math.trunc(X/line);
            puzzleItem.style.backgroundPosition = `${-X*scaling/line}px ${-Y*scaling/line}px`;
            puzzleItem.style.backgroundSize = `${scaling}px`;
        });
    },

    randomMix () {
        this.properties.random = true;
        let current = this.properties.end, sign = ''; 
        let randomDirection, line, direction, distance, target, order, pressed, previousTurn;
        const moveRight = 0, moveLeft = 1, moveUp = 2, moveDown = 3;
        for (let i = this.elements.puzz.length-1; i > 0; i -= 1) {
            if (this.elements.puzz[i].textContent === String(this.properties.end + 1)) {
                current = i;
                target = i;
            }
        }
        const think = () => {
            randomDirection = Math.floor(Math.random()*4);
            if ((current === moveRight && randomDirection === moveLeft)
             || (current === this.properties.end && randomDirection === moveRight)
             || (current < (0 + this.properties.line) && randomDirection === moveDown)
             || (current > (this.properties.end - this.properties.line) && randomDirection === moveUp)
             || (randomDirection === moveLeft && Math.trunc(current/this.properties.line) !== Math.trunc((current-1)/this.properties.line))
             || (randomDirection === moveRight && Math.trunc(current/this.properties.line) !== Math.trunc((current+1)/this.properties.line))
             || (randomDirection === moveRight && previousTurn === moveLeft)
             || (randomDirection === moveLeft && previousTurn === moveRight)
             || (randomDirection === moveUp && previousTurn === moveDown)
             || (randomDirection === moveDown && previousTurn === moveUp)) {
                think();
            }
        }
        const maxRandomMixing = 1.8;
        for (let j = 0; j < this.properties.end**maxRandomMixing; j += 1) {
            current = target;
            think();
            previousTurn = randomDirection;
            switch(randomDirection) {
                case moveRight: {
                    target = current + 1; 
                    line = 1; 
                    sign = '-'; 
                    direction = 'X'; 
                    break;
                }
                case moveLeft: {
                    target = current - 1; 
                    line = 1; 
                    sign = '+'; 
                    direction = 'X'; 
                    break;
                }
                case moveUp: {
                    target = current + this.properties.line; 
                    line = this.properties.line; 
                    sign = '-'; 
                    direction = 'Y'; 
                    break;
                }
                case moveDown: {
                    target = current - this.properties.line; 
                    line = this.properties.line; 
                    sign = '+'; 
                    direction = 'Y'; 
                    break;
                }
                default: break;
            }
            switch(sign) {
                case '+': order = current - line; break;
                case '-': order = current + line; break;
                default: break;
            }
            pressed = this.elements.puzz[target];
            distance = '100%';
            this.moves.step.push({pressed, order, line, direction, distance, sign});
            this.movePuzzles(this.elements.puzz[target], this.elements.puzz[current]);       
        }
        this.properties.random = false;
    },

    openPauseMenu () {
        if (document.querySelector('.win')) {
            document.body.removeChild(document.querySelector('.win'));
        }
        if (!this.properties.play) {
            this.properties.solve = false;
            if (document.querySelector('.scoreMenu')) {
                document.body.removeChild(document.querySelector('.scoreMenu'));
                this.elements.game.style.visibility = 'visible';
            }
            this.properties.speed = 250;
            if (!this.properties.sound) {
                this.elements.sound[3].play();
            }
            this.elements.game.style.opacity = 0;
            this.elements.game.animate(
                [
                    { opacity: 1 },
                    { opacity: 0}
                ], {
                    duration: 1000,
                    easing: 'ease'
                }
            );
            document.body.appendChild(this.elements.open);
            this.properties.play = true;
            this.time();
            this.elements.pause.innerHTML = "<i class='material-icons'>play_arrow</i>";
            this.elements.pause.animate(
                [
                    { transform: 'rotate(0)', filter: 'blur(5px)' },
                    { transform: 'rotate(120deg)', filter: 'blur(0)' }
                ],{
                    duration: 250
                }
            );
        }
        else {
            if (!this.properties.sound) {
                this.elements.sound[4].play();
            }
            const close = document.querySelector(".open");
            this.elements.game.style.opacity = 1;
            this.elements.game.animate(
                [
                    { opacity: 0 },
                    { opacity: 1 }
                ], {
                    duration: 1000,
                    easing: 'ease'
                }
            );
            document.body.removeChild(close);
            this.properties.play = false;
            this.time();
            this.elements.pause.innerHTML = "<i class='material-icons'>pause</i>";
            this.elements.pause.animate(
                [
                    { transform: 'rotate(90deg)', filter: 'blur(5px)' },
                    { transform: 'rotate(0deg)', filter: 'blur(0)' }
                ],{
                    duration: 250
                }
            );
        }
    },

    optionsList () {
        const fragment = document.createDocumentFragment();
        const optionsCount = 7;
        for (let i = 0; i < optionsCount; i+=1) {
            const listItem = document.createElement("div");
            listItem.classList.add("listItem");
            switch (i) {
                case 0: {
                    const startNewGame = document.createElement("button");
                    startNewGame.classList.add("start", "option");
                    startNewGame.innerText = "Start new game";
                    this.elements.startNewGame = startNewGame;
                    const select = document.createElement("select");
                    select.innerHTML = "<option value='3'>3×3</option>"+
                                       "<option value='4' selected>4×4</option>"+
                                       "<option value='5'>5×5</option>"+
                                       "<option value='6'>6×6</option>"+
                                       "<option value='7'>7×7</option>"+
                                       "<option value='8'>8×8</option>";
                    this.elements.select = select;
                    listItem.appendChild(startNewGame);
                    listItem.appendChild(select);
                    startNewGame.addEventListener('click', () => {
                        if (!this.properties.solve){
                            this.startNewGame();
                            this.randomMix();
                            this.openPauseMenu();
                            this.properties.numbers = !this.properties.numbers;
                            this.numbersOption(this.elements.list[5]);
                        }
                    });
                    break;
                }
                case 1: {
                    listItem.innerHTML = "<button class='save option'>Save game</button>"+
                                          "<i class='material-icons'>save</i>";
                    listItem.addEventListener('click', () => {
                        if (!this.properties.solve) {
                            this.save();
                        }
                    });
                    break;
                }
                case 2: {
                    listItem.innerHTML = "<button class='load option'>Load game</button>"+
                                          "<i class='material-icons'>get_app</i>";
                    listItem.addEventListener('click', () => {
                        if (!this.properties.solve) {
                            this.load();
                            this.properties.numbers = !this.properties.numbers;
                            this.numbersOption(this.elements.list[5]);
                            this.openPauseMenu();
                        }
                    });
                    break;
                }
                case 3: {
                    listItem.innerHTML = "<button class='score option'>Score</button>"+
                                          "<i class='material-icons'>leaderboard</i>";
                    listItem.addEventListener('click', () => {
                        if (localStorage.getItem('score')) {
                            this.showScore();
                        }
                    });
                    break;
                }
                case 4: {
                    listItem.innerHTML = "<button class='sound option'>Sound</button>"+
                                          "<i class='material-icons'>volume_up</i>";
                    listItem.addEventListener('click', () => {
                        this.soundOption(listItem);
                    });
                    break;
                }
                case 5: {
                    listItem.innerHTML = "<button class='show option'>Numbers</button>"+
                                          "<i class='material-icons'>visibility_off</i>";
                    listItem.addEventListener('click', () => {
                        this.numbersOption(listItem);
                    });
                    break;
                }
                case 6: {
                    listItem.innerHTML = "<button class='help option'>Solve puzzle</button>"+
                                          "<i class='material-icons'>extension</i>";
                    listItem.addEventListener('click', () => {
                        if (!this.moves.win && !this.properties.solve) {
                            this.solve();
                            this.openPauseMenu();
                        }
                    });
                    break;
                }
                default: break;
            }
            this.elements.list.push(listItem);
            fragment.appendChild(listItem);
        }
        return fragment;
    },

    showScore () {
        this.elements.game.style.visibility = 'hidden';
        this.openPauseMenu();
        this.properties.play = true;
        this.time();
        this.properties.play = false;
        this.elements.pause.innerHTML = "<i class='material-icons'>clear</i>";
        this.elements.score = JSON.parse(localStorage.getItem('score'));
        const maxResultsNumber = 10;
        const scoreMenu = document.createElement('div');
        scoreMenu.classList.add('scoreMenu');
        let {score} = this.elements;
        let i = 0;
        score.sort( (a,b) => {
            if (a.size > b.size) {
                return -1;
            }
        });
        score.sort( (a,b) => {
            if (a.size === b.size && Number(a.turn.replace('turn ','')) < Number(b.turn.replace('turn ',''))) {
                return -1;
            }
        });
        i = 0;
        while (i < maxResultsNumber && score[i]) {
            const rank = document.createElement('div');
            rank.classList.add('rank');
            rank.innerHTML = `<p>${i+1}</p><p>size ${score[i].size}x${score[i].size}</p><p>${score[i].turn}</p><p>${score[i].time}</p>`;
            scoreMenu.appendChild(rank);
            i += 1;
        }
        document.body.appendChild(scoreMenu);
    },

    save () {
        const currentState = []; const movesHistory = [];
        this.elements.puzz.forEach( puzzleItem => {
            const puzzle = puzzleItem;
            const {width, height, order, background} = puzzle.style;
            const {textContent} = puzzle;
            currentState.push({width, height, order, background, textContent});
        });
        this.moves.step.forEach( movesItem => {
            const pressed = movesItem.pressed.textContent,
                  order = movesItem.order,
                  line = movesItem.line,
                  direction = movesItem.direction,
                  distance = movesItem.distance,
                  sign = movesItem.sign;
            movesHistory.push({pressed, order, line, direction, distance, sign});
        });
        localStorage.setItem('currentState', JSON.stringify(currentState));
        localStorage.setItem('movesHistory', JSON.stringify(movesHistory));
        localStorage.setItem('turn', this.elements.turn.textContent);
        localStorage.setItem('time', this.properties.time);
        localStorage.setItem('timeContent', this.elements.time.textContent);
        localStorage.setItem('end', this.properties.end);
        localStorage.setItem('line', this.properties.line);
    },
    
    load () {
        if (localStorage.getItem('currentState') && localStorage.getItem('movesHistory')) {
            this.moves.win = false;
            this.elements.turn.textContent = localStorage.getItem('turn');
            this.properties.time = Number(localStorage.getItem('time'));
            this.elements.time.textContent = localStorage.getItem('timeContent');
            this.properties.end = Number(localStorage.getItem('end'));
            this.properties.line = Number(localStorage.getItem('line'));
            const currentState = JSON.parse(localStorage.getItem('currentState'));
            const movesHistory = JSON.parse(localStorage.getItem('movesHistory'));
            const puzzlesFragment = document.createDocumentFragment();
            this.elements.puzz = [];
            for (let i=0; i<=this.properties.end; i+=1) {
                const element = document.createElement("button");
                const style = currentState[i];
                element.classList.add("element");
                element.style.order = style.order;
                element.style.width = style.width;
                element.style.height = style.height;
                element.style.background = style.background;
                element.textContent = style.textContent;
                if (style.textContent === String(this.properties.end+1)) {
                    element.style.opacity = 0;
                }
                element.addEventListener('mousedown', (mousedown) => {
                    this.dragAndDrop(mousedown, element);
                });
                this.elements.puzz.push(element);
                puzzlesFragment.appendChild(element);
            }
            this.elements.game.innerHTML = "";
            this.elements.game.appendChild(puzzlesFragment);
            this.moves.step = [];
            for (let i=0; i<movesHistory.length; i+=1) {
                for (let j=0; j<this.elements.puzz.length; j+=1){
                    if (this.elements.puzz[j].textContent === movesHistory[i].pressed) {
                        movesHistory[i].pressed = this.elements.puzz[j];
                    }
                }
            }
            this.moves.step = movesHistory;
        }
        this.redraw();
    },

    soundOption (listItem) {
        if (!this.properties.sound) {
            listItem.innerHTML = "<button class='sound option'>Sound</button>"+
                                  "<i class='material-icons'>volume_off</i>";
            this.properties.sound = true;
        }
        else {
            listItem.innerHTML = "<button class='sound option'>Sound</button>"+
                                  "<i class='material-icons'>volume_up</i>";
            this.properties.sound = false;
        }
    },

    numbersOption (listItem) {
        if (!this.properties.numbers) {
            listItem.innerHTML = "<button class='show option'>Numbers</button>"+
                                  "<i class='material-icons'>visibility</i>"; 
            this.properties.numbers = true;
            this.elements.puzz.forEach( puzzle => {
                puzzle.style.color = 'rgba(255, 255, 255)';
                puzzle.style.textShadow = '0 0 10px black';
            });
        }
        else {
            listItem.innerHTML = "<button class='show option'>Numbers</button>"+
                                  "<i class='material-icons'>visibility_off</i>"; 
            this.properties.numbers = false;
            this.elements.puzz.forEach( puzzle => {
                puzzle.style.color = 'rgba(255, 255, 255, 0)';
                puzzle.style.textShadow = 'none';
            });
        }
    },

    startNewGame () {
        this.properties.line = Number(document.querySelector('select').value);
        this.properties.end = this.properties.line**2 - 1;
        this.properties.time = 0;
        this.elements.time.textContent = 'time 00:00';
        this.elements.turn.textContent = 'turn 0';
        this.elements.puzz = [];
        this.moves.step = [];
        this.moves.win = false;
        this.properties.begin = false;
        this.properties.speed = 250;
        this.elements.game.innerHTML = "";
        this.elements.game.appendChild(this.start());
    },

    start() {
        const fragment = document.createDocumentFragment();
        const randomImage = Math.floor(1 + Math.random()*150);
        const src = `assets/${randomImage}.jpg`;
        let Y = 0; let X = 0;
        for (let item = 0; item<=this.properties.end; item+=1) {
            const element = document.createElement("button");
            element.classList.add("element");
            element.style.width = `${ 99 / this.properties.line }%`;
            element.style.height = `${ 99 / this.properties.line }%`;
            element.style.order = item;
            element.textContent = item + 1;
            if (Math.trunc((item) / this.properties.line) > Y) {
                Y += 1;
                X = 0;
            }
            const scaling = Number(window.getComputedStyle(document.querySelector('.menu')).width.replace('px',''));
            element.style.background = `url(${src})`;
            element.style.backgroundPosition = `${-X*scaling/this.properties.line}px ${-Y*scaling/this.properties.line}px`;
            element.style.backgroundSize = `${scaling}px`;
            X += 1;
            if (item === this.properties.end) {
                element.style.opacity = 0;
            }
            this.elements.puzz.push(element);
            element.addEventListener('mousedown', (mousedown) => {
                this.dragAndDrop(mousedown, element);
            });
            fragment.appendChild(element);
        }
        return fragment;
    },

    dragAndDrop (mousedown, element) {
        if (Number(element.textContent) !== this.properties.end + 1) {
            const clone = document.createElement('div');
            let target;
            const {offsetX, offsetY} = mousedown;
            clone.classList.add("clone");
            for (let i = 0; i<this.elements.puzz.length; i+=1) {
                if (this.elements.puzz[i].textContent === String(this.properties.end+1)) {
                    target = this.elements.puzz[i];
                }
            }
            clone.style.position = 'absolute';
            clone.style.zIndex = 2;
            clone.textContent = element.textContent;
            if (this.properties.numbers) {
                clone.style.color = '#fff';
                clone.style.textShadow = '0 0 10px #000';
            }
            clone.style.background = element.style.background;
            clone.style.width = window.getComputedStyle(element).width;
            clone.style.height = window.getComputedStyle(element).height;
            document.body.append(clone);
            element.style.opacity = 0;
            const moveAt = (pageX, pageY) => {
                clone.style.left = `${pageX - offsetX  }px`;
                clone.style.top = `${pageY - offsetY  }px`;
            }
            moveAt(mousedown.pageX, mousedown.pageY);
            const onMouseMove = (event) => {
                this.properties.animation+=1;
                moveAt(event.pageX, event.pageY);
            }
            document.addEventListener('mousemove', onMouseMove);
            clone.onmouseup = () => {
                if (clone.offsetLeft > target.offsetLeft-target.offsetWidth/2 && clone.offsetLeft < target.offsetLeft+target.offsetWidth/2
                 && clone.offsetTop > target.offsetTop-target.offsetHeight/2 && clone.offsetTop < target.offsetTop+target.offsetHeight/2) {
                    this.check(element);
                }
                else if (this.properties.animation < 5) {
                    this.check(element);
                }
                this.properties.animation = 0;
                document.removeEventListener('mousemove', onMouseMove);
                document.body.removeChild(clone);
                element.style.opacity = 1;
                clone.onmouseup = null;
            }
        }
    },

    check(pressed) {
        const order = Number(pressed.style.order);
            const {line} = this.properties;
            const {height, width} = window.getComputedStyle(pressed);
        if (this.elements.puzz[order+1]
         && this.elements.puzz[order+1].style.order % line
         && this.elements.puzz[order+1].textContent === String(this.properties.end+1)) {
            this.animationPush(pressed, order, 1, 'X', width, '+');
        }
        if (this.elements.puzz[order-1]
         && this.elements.puzz[order].style.order % line
         && this.elements.puzz[order-1].textContent === String(this.properties.end+1)) {
            this.animationPush(pressed, order, 1, 'X', width, '-');
        }
        if (this.elements.puzz[order+line]
         && this.elements.puzz[order+line].textContent === String(this.properties.end+1)) {
            this.animationPush(pressed, order, line, 'Y', height, '+');
        }
        if (this.elements.puzz[order-line]
         && this.elements.puzz[order-line].textContent === String(this.properties.end+1)) {
            this.animationPush(pressed, order, line, 'Y', height, '-');
        }
    },

    animationPush(pressed, order, line, direction, distance, sign) {
        const {speed} = this.properties;
        const dragAndDropMaxMovingCount = 20;
        this.elements.puzz.forEach( puzzleItem => {
            puzzleItem.disabled = true;
        });
        if (!this.properties.solve) {
            this.moves.step.push({pressed, order, line, direction, distance, sign});
        }
        if (!this.properties.sound) {
            const random = Math.floor(Math.random()*3);
            this.elements.sound[random].volume = 0.2;
            this.elements.sound[random].play();
        }
        let resign;
        if (sign === '+') resign = '-';
        else resign = '+';
        if (this.properties.animation < dragAndDropMaxMovingCount) {
            pressed.animate([
                { transform: `translate${ direction }(${ resign  }${distance })`},
                { transform: `translate${ direction }(${ sign  }${0 })`}
            ], {
                duration: speed,
                easing: 'ease'
            });
        }
        this.movePuzzles(this.elements.puzz[order], this.elements.puzz[order+Number(sign+line)]);
    },

    movePuzzles(from, to) {
        if (!this.properties.random) {
            if (!this.properties.solve) {
                this.elements.puzz.forEach( puzzleItem => {
                    puzzleItem.disabled = false;
                });
            }
            const turn = Number(this.elements.turn.textContent.replace('turn ', '')) + 1;
            this.elements.turn.textContent = `turn ${  turn}`;
            if (!this.properties.begin) {
                this.properties.begin = true;
                this.time();
            }
            this.moves.win = false;
        }
        let change = from;
        let win;
        this.elements.puzz[from.style.order] = to;
        this.elements.puzz[to.style.order] = change;
        change = from.style.order;
        from.style.order = to.style.order;
        to.style.order = change;
        if (!this.properties.random) {
            win = this.winCondition();
        }
        if (win) {
            setTimeout( () => {
                this.winMessage();
            }, this.properties.speed);
        }
    },

    winCondition () {
        for (let i=this.elements.puzz.length-1; i>0; i-=1) {
            if (Number(this.elements.puzz[i].textContent)-1 !== Number(this.elements.puzz[i-1].textContent)) {
                return false;
            }
        }
        return true;
    },

    winMessage () {
        this.elements.puzz.forEach( puzzleItem => {
            puzzleItem.disabled = false;
        });
        if (!this.properties.sound) {
            this.elements.sound[5].play();
        }
        const message = document.createElement('div');
        const startNewGame = document.createElement("button");
        const select = document.createElement("select");
        const button = document.createElement('div');
        startNewGame.classList.add("start", "option");
        startNewGame.innerText = "Start new game?";
        select.innerHTML = "<option value='3'>3×3</option>"+
                            "<option value='4' selected>4×4</option>"+
                            "<option value='5'>5×5</option>"+
                            "<option value='6'>6×6</option>"+
                            "<option value='7'>7×7</option>"+
                            "<option value='8'>8×8</option>";
        startNewGame.addEventListener('click', () => {
            this.startNewGame();
            this.randomMix();
            this.properties.numbers = !this.properties.numbers;
            this.numbersOption(this.elements.list[5]);
        });
        button.classList.add('afterWin');
        startNewGame.addEventListener('click', () => {
            const remove = document.querySelector('.win');
            document.body.removeChild(remove);
        })
        message.classList.add('win');
        message.innerHTML = `You solved puzzle\r\nin${this.elements.time.textContent.replace('time','')
                           } and${this.elements.turn.textContent.replace('turn','')} turn\r\n`;
        button.appendChild(startNewGame);
        button.appendChild(select);
        message.appendChild(button);
        document.body.appendChild(message);
        this.moves.win = true;
        this.moves.step = [];
        this.properties.begin = false;
        this.time();
        const turn = this.elements.turn.textContent;
        const time = this.elements.time.textContent;
        const size = this.properties.line;
        this.elements.score.push( { size, turn, time } );
        localStorage.setItem('score', JSON.stringify(this.elements.score));
    },

    time () {
        let min; let sec;
        const time = () => {
            this.properties.time+=1;
            sec = this.properties.time % 60;
            min = Math.floor(this.properties.time / 60);
            if (min < 10) {
                min = `0${  min}`;
            }
            if (sec < 10) {
                sec = `0${  sec}`;
            }
            this.elements.time.textContent = `time ${  min  }:${  sec}`;
        }
        
        if (!this.properties.play && this.properties.begin) {
            this.properties.interval = setInterval(time, 1000);
        }
        else {
            clearInterval(this.properties.interval);
        }
    },

    solve () {
        this.properties.solve = true;
        this.properties.speed = 100;
        if (this.properties.play) {
            this.time();
        }
        this.elements.pause.innerHTML = "<i class='material-icons'>pause</i>";
        let i = this.moves.step.length-1;
        let interval;
        const back = () => {
            let {sign} = this.moves.step[i];
            const {pressed} = this.moves.step[i];
            let {order} = this.moves.step[i];
            const {line} = this.moves.step[i];
            const {direction} = this.moves.step[i];
            const {distance} = this.moves.step[i];
            if (sign === '+') {
                sign = '-';
                order += line;
            }
            else {
                sign = '+';
                order -= line;
            }
            this.animationPush(pressed, order, line, direction, distance, sign);
            i-=1;
            if (this.properties.play) {
                this.properties.solve = false;
                this.moves.step = this.moves.step.slice(0, i+1);
                clearInterval(interval);
            }
            if (i === -1) {
                this.moves.step = [];
                this.properties.speed = 250;
                this.properties.begin = !this.properties.begin;
                this.properties.solve = !this.properties.solve;
                this.moves.win = true;
                this.time();
                clearInterval(interval);
            }
        }
        interval = setInterval(back, this.properties.speed);
    }
}

Puzzle.init();
