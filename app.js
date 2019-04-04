let app = (function() {

    let status = {
        gameStart : null,
        timeID : null,
        difficulty : null
    };

    let dom = {};

    let initializer = function(difficulty) {

        status.gameStart = null;
        status.difficulty = difficulty;

        // Prepare UI
        if(document.querySelector('.field')) {document.querySelector('.field').remove();}
        document.querySelector('.container').className = 'container';

        clearInterval(status.timeID);
        document.querySelector('.minute').textContent = '00';
        document.querySelector('.seconds').textContent = '00';

        document.querySelector('.emo').setAttribute('src', "img/smile.png")
        

        makeGameBoard(difficulty);
        layMines(difficulty);
        setNumbers();
        addRefOfElement();
        setupEventListener();

        document.querySelector('.mine span').textContent = status.mineNum;
    };

    // make table and cells for game board
    let makeGameBoard = function(difficulty) {
        let col;
        switch(difficulty) {
            case 'easy': col = 10; break;
            case 'normal' : col = 20; break;
            case 'hard' : col = 30; break;
        }

        let table = document.createElement('table');
        table.setAttribute('class', 'field');
    
        for(let k = 0; k < 12; k++) {
            let tableRow = document.createElement('tr');
            tableRow.setAttribute('id', k);
            for(let i = 0; i < col; i++) {
                let cell = document.createElement('td');
                cell.setAttribute('class', 'cover');
                cell.setAttribute('data-col', i);
                tableRow.appendChild(cell);
            }
            table.appendChild(tableRow);
        }
        
        document.querySelector('.container').classList.add(difficulty);
        document.querySelector('.container').appendChild(table);
    };

    // lay mines on random positions
    let layMines = function(difficulty) {
        switch(difficulty) {
            case 'easy': status.mineNum = 15; break;
            case 'normal' : status.mineNum = 40; break;
            case 'hard' : status.mineNum = 60; break;
        }
        dom.cells = document.querySelectorAll('.field td');

        for(let i = status.mineNum; i > 0;) {
            let ranNum = Math.floor(Math.random() * dom.cells.length);
            let cell = dom.cells[ranNum]
            if(!cell.classList.contains('potato')) {
                cell.classList.add('potato');
                i--;
            }
        }
    };

    // set numbers around mines
    let setNumbers = function() {
        let mines = document.querySelectorAll('.potato');
        for(let j = 0; j < mines.length; j++) {
            let row = parseInt(mines[j].parentElement.id);
            let col = parseInt(mines[j].dataset.col);
    
            for(let k = row - 1; k <= row + 1; k++) {
                let curRow = document.getElementById(k);
    
                if(curRow) {
                    for(let i = col - 1; i <= col + 1; i++) {
                        if(curRow.children[i] && !curRow.children[i].classList.contains('potato')) {
                            addNumbers(curRow.children[i]);
                        }
                    }
                }
            }
        }
    };

    function addNumbers(el) {
        let row = parseInt(el.parentElement.id);
        let col = parseInt(el.dataset.col);
        let count = 0;

        for(let k = row - 1; k <= row + 1; k++) {
            let curRow = document.getElementById(k);
            if(curRow) {
                for(let i = col - 1; i <= col + 1; i++) {
                    if(curRow.children[i]) {
                        if(curRow.children[i].classList.contains('potato')) count++;
                    }
                }
            } 
        }
        el.textContent = count;
    };

    let addRefOfElement = function() {
        dom.cells.forEach(cur => {
            if(!cur.classList.contains('potato')) {
                let row = parseInt(cur.parentElement.id);
                let col = parseInt(cur.dataset.col);
                
                cur.adjacentElements = [];
                if(cur.previousElementSibling) {cur.adjacentElements.push(cur.previousElementSibling);}
                if(cur.nextElementSibling) {cur.adjacentElements.push(cur.nextElementSibling);}
                
                for(let i = row -1; i <= row + 1; i = i + 2) {
                    if(i >= 0 && i < 12) {
                        for(let j = col - 1; j <= col + 1; j++) {
                            if(document.getElementById(i).children[j]) {
                                cur.adjacentElements.push(document.getElementById(i).children[j])
                            }
                        }
                    }
                }
            }
        })
    };

    let setupEventListener = function() {
        document.querySelector('.field').addEventListener('click', function(e) {
            e.preventDefault();
            if(e.target.tagName === 'TD') {
                
                if(status.gameStart === null) {
                    status.gameStart = 'on';
                    let sec = 0;
                    let min = 0;
                    status.timeID = setInterval(function() {
                        sec++;
                        if(sec === 60) {
                            min++;
                            min < 10 ? min = '0' + min : min;
                            document.querySelector('.minute').textContent = min;
                            sec = 0;
                        }
                        sec < 10 ? sec = '0' + sec : sec;
                        document.querySelector('.seconds').textContent = sec;
                    }, 1000);
                }
    
                if(e.target.classList.contains('potato') && status.gameStart === 'on') {
                    e.target.classList.add('explosion');
                    document.querySelectorAll('.field td').forEach(cur => cur.classList.remove('cover'));
                    document.querySelector('.emo').setAttribute('src', "img/crying.png");
                    clearInterval(status.timeID);
                    status.gameStart = 'off';
                }
    
                e.target.classList.remove('cover');
    
                if(e.target.textContent === '' && !e.target.classList.contains('potato')) {
                    e.target.classList.add('searched');
                    search_contiguous(e.target.adjacentElements);
                }
            }
        });
    
        document.querySelector('.emo').addEventListener('click', function() {
            console.log('The app was initialized');
            document.querySelector('.field').remove();
            initializer(status.difficulty);
        });

        document.querySelector('.navigation-list').addEventListener('click', function(e) {
            initializer(e.target.dataset.diff);
            document.querySelector('.navigation-checkbox').checked = false;
        });

        document.querySelector('.field').addEventListener('mousedown', function(e) {
            if(e.target.tagName === 'TD' && status.gameStart === 'on') {
                document.querySelector('.emo').setAttribute('src','img/wink.png');
            }
        });

        document.querySelector('.field').addEventListener('mouseup', function(e) {
            if(e.target.tagName === 'TD' && status.gameStart === 'on') {
                document.querySelector('.emo').setAttribute('src','img/smile.png');
            }
        })

    };

    function search_contiguous(nodeList) {
        
        nodeList.forEach(curNode => {
            if(!curNode.classList.contains('searched')) {
                curNode.classList.remove('cover');
                curNode.classList.add('searched');
                if(curNode.textContent === '') {
                    search_contiguous(curNode.adjacentElements);
                }
            }
        });
    };

    function isMissionComplete() {
        let flagged = document.querySelectorAll('.flag');
        let count = 0;
        for(let i = 0; i < flagged.length; i++) {
            if(flagged[i].classList.contains('potato')) {
                count++;
            }
        }
        if(flagged.length === status.mineNum && count === status.mineNum) {
            alert('You succeeded!');
        }
    };

    window.addEventListener('contextmenu', function(e) {
        if(e.target.tagName === 'TD') {
            e.preventDefault();
            if(e.target.classList.contains('cover')) {
                e.target.classList.toggle('flag');
            }
            isMissionComplete();
        };
    });

    return {
        init : function(difficulty) {
            initializer(difficulty)
        }
    }

})();

app.init('easy');