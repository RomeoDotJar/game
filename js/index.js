//const PIXI = require('pixi.js')

const app = new PIXI.Application()
await app.init({
    resizeTo:window,
    backgroundAlpha:0,
    antialias: true,
    transparent: false,
    resolution: 1
});
console.log(document.body.getElementsByClassName('canvas'))
document.body.appendChild(app.canvas);

function w(f) {
    return app.canvas.width*f
}
function h(f) {
    return app.canvas.height*f
}

var wg = 0;
var hg = 0;

var unit = 0;
var hgOffset = 0;

var origX = 0;
var origY = 0;

var midX = 0;

var ballX = 0;
var ballY = 0;

function updSizes() {
    wg = grid.at(0).length;
    hg = grid.length;

    unit = Math.min(h(.75/hg), w(.8/wg));
    hgOffset = -h(.05);

    origX = w(.5)-unit*wg/2;
    origY = h(.5)-unit*hg/2+hgOffset;

    midX = origX+unit*wg/2;

    ballX = midX;
    ballY = origY+unit*hg-unit*.5;
}

const cellFont = await PIXI.Assets.load('fnt/ss.fnt');
await PIXI.Assets.load('img/ball.png');

let ball = PIXI.Sprite.from('img/ball.png');

app.stage.addChild(ball);

let elapsed = 0.0;

let ballsIn = 1;

let gridW = 6;
let gridH = 10;

let row = [];
let grid = [];
for (let i=0;i<gridW;i++) row.push({
    power: 0,
    type: 0
});
for (let i=0;i<gridH;i++) grid.push(row);

if (Math.random()*100<1)
    grid = [
        [0,0,0,0,0],
        [0,64,0,36,0],
        [1,0,49,0,25],
        [0,4,0,16,0],
        [0,0,9,0,0],
        [0,0,0,0,0],
        [0,0,0,0,0]
    ];

let timerD=4;
let timer=1;
let ballsOut = [];// {}

let ballR = 10;
let ballSpd = 12;

let toBeLaunched = [0,0,0];
let aimVector = [0,0];

app.stage.eventMode = 'static'
app.stage.ontouchstart = (event) => {
    aimVector = [event.x-midX, event.y-origY-unit*hg+unit*.5];
}
app.stage.ontouchmove = (event) => {
    aimVector = [event.x-midX, event.y-origY-unit*hg+unit*.5];
    console.log(aimVector);
}
app.stage.ontouchend = (event) => {
    if (ballsIn>0) {
        toBeLaunched = [-aimVector[0],-aimVector[1],ballsIn];
        ballsIn=0;
    }
    aimVector = [0,0];
}
app.stage.ontouchcancel = (event) => {
    aimVector = [0,0];
}

//const PIXI = require('pixi.js')

const borderWidth = 10;
const cornerRadius = 10;
const cellGap = 0;
const cellBorderWidth = 2;

var graph = new PIXI.Graphics();
app.stage.addChild(graph);

var graphBalls = new PIXI.Graphics();
app.stage.addChild(graphBalls);

var cellTexts = new PIXI.Container();
cellTexts.label='cellTexts';
app.stage.addChild(cellTexts);

var ballsC = new PIXI.Container();
ballsC.label='balls';
app.stage.addChild(ballsC);

let lastLaunchTime = 0;
let cooldown = 0.1;

let maxDist = 300;

function initAll() {
    elapsed = 0.0;

    ballsIn = 1;

    gridW = 6;
    gridH = 10;

    row = [];
    grid = [];
    for (let i=0;i<gridW;i++) row.push({
        power: 0,
        type: 0
    });
    for (let i=0;i<gridH;i++) grid.push(row);

    if (Math.random()*100<1)
        grid = [
            [0,0,0,0,0],
            [0,64,0,36,0],
            [1,0,49,0,25],
            [0,4,0,16,0],
            [0,0,9,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ];

    timerD=4;
    timer=1;
    ballsOut = [];// {}

    ballR = 10;
    ballSpd = 12;

    toBeLaunched = [0,0,0];
    aimVector = [0,0];
    
    lastLaunchTime = 0;
    cooldown = 0.1;

    maxDist = 300;

    drawGrid();
}

function drawGrid() {
    app.stage.getChildByLabel('cellTexts').removeChildren();

    ball.anchor.set(.5,.5);
    ball.y=h(.5);
    ball.x=w(.3);

    updSizes();
    
    graph
      .clear()
      .roundRect(origX-borderWidth, origY-borderWidth, wg*unit+borderWidth*2, hg*unit+borderWidth*2, cornerRadius)
      .fill(0xffffff,.8)
      .roundRect(origX, origY, wg*unit, hg*unit, cornerRadius)
      .fill(0x131320,.95);

    for (let i = 0; i<grid.length; i++) {
        for (let c = 0; c<grid.at(i).length; c++) {
            let cell = grid.at(i).at(c);

            if (cell.power>0) {
                const text = new PIXI.BitmapText({
                    text: cell.power,
                    style: {
                        fontFamily: ['sans-serif'],
                        fontSize: Math.min(w(1)/17,h(1)/30),
                        align: 'center',
                    }
                })
                text.groupColor=0xFFFFFF;
                text.anchor.set(.5,.5);
                text.x=origX+unit/2+unit*c;
                text.y=origY+unit/2+unit*i;
                app.stage.getChildByLabel('cellTexts').addChild(text);

                graph
                  .rect(
                      origX-cellBorderWidth+unit*c, origY-cellBorderWidth+unit*i, unit+cellBorderWidth*2, unit+cellBorderWidth*2)
                  .fill(0xffffff)
                  .rect(
                      origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i, unit-cellGap-cellBorderWidth*2, unit-cellGap-cellBorderWidth*2)
                  .fill(0x000000)
                  .poly([
                    new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i),
                    new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*i),
                    new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*c, origY+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*i)
                    ])
                  .fill(0x131320);
            }
        }
    }
}
drawGrid();

let deltaX0=0;
let deltaY0=0;
let smoothing=3;
function drawBalls() {
    app.stage.getChildByLabel('balls').removeChildren();

    graphBalls.clear();

    if (ballsIn>0 || toBeLaunched[2]>0) {
        let deltaX = (deltaX0*smoothing+(-aimVector[0]*2.2))/(smoothing+1);
        let deltaY = (deltaY0*smoothing+(-aimVector[1]*2.2))/(smoothing+1);
        deltaX0 = deltaX;
        deltaY0 = deltaY;

        let dist = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
        
        let nodes=1+dist/30;

        for (let i=0;i<nodes;i++) {
            let dX = deltaX*(i+elapsed%1)/nodes;
            let dY = deltaY*(i+elapsed%1)/nodes;

            if (dX>wg*unit*.5 || dX<-wg*unit*.5) {
                continue;
            }
            if (ballY+dY>origY+hg*unit || ballY+dY<origY) {
                continue;
            }

            let dist0 = Math.sqrt(dX*dX+dY*dY);
            let usedDist = Math.min(maxDist,dist);

            graphBalls
              .circle(ballX+dX, ballY+dY, 3+4.5*(1-dist0/usedDist))
              .fill(0xFFFFFF, Math.max(0, 1-dist0/usedDist));
        }
        graphBalls
          .circle(ballX, ballY, ballR+Math.min(13,(ballsIn+toBeLaunched[2])/10))
          .fill(0xFFFFFF);
    }
    
    for (let i=0;i<ballsOut.length;i++) {
        let ball = ballsOut.at(i);
        let x = ball.x
        let y = ball.y
        let xV = ball.xV
        let yV = ball.yV
        
        //let trailNodes = 30;
        //let size = 100;
        
        //for (let i=0;i<trailNodes;i++) {
        //    graphBalls
        //      .circle(x-xV*i/trailNodes*size, y-yV*i/trailNodes*size, 10*(1-i/trailNodes))
        //      .fill(0xFFFFFF, 5/trailNodes);//1-i/trailNodes);
        //}
        graphBalls
          .circle(x, y, ballR)
          .fill(0xFFFFFF);
    }
}

//const PIXI = require('pixi.js')

app.canvas.onresize = (event) => {
    drawGrid();
}
window.onresize = (event) => {
    drawGrid();
}
app.renderer.on('resize', (width, height) => {
    drawGrid();
})

function ballCheck(ball) {
    if (ball.y>=origY+hg*unit) {
        console.log('pop');
        ballsIn++;
        ballsOut.splice(ballsOut.indexOf(ball), 1);
        return;
    }

    if (ball.y-ballR/2<origY) {
        ball.yV*=-1;
        ball.y=origY+ballR/2;
    }
    if (ball.x-ballR/2<origX) {
        ball.xV*=-1;
        ball.x=origX+ballR/2;
    }
    else if (ball.x+ballR/2>origX+wg*unit) {
        ball.xV*=-1;
        ball.x=origX+wg*unit-ballR/2;
    }

    let bounced=false;
    for (let r=0;r<grid.length;r++) {
        if(bounced)break;
        for (let c=0;c<grid.at(r).length;c++) {
            if(bounced)break;
            let cell = grid.at(r).at(c);
            if (cell.power>0) {
                let distYbot=ball.y-origY-unit*r-unit;
                let distYtop=ball.y-origY-unit*r;
                let distXleft=ball.x-origX-unit*c;
                let distXright=ball.x-origX-unit*c-unit;
                
                let col = false;
                let nodes = 1;
                
                for (let i=0;i<nodes;i++) {
                    let distYbot0 = distYbot-(i/nodes)*ball.xV*ballSpd;
                    let distYtop0 = distYtop-(i/nodes)*ball.xV*ballSpd;
                    let distXleft0= distXleft-(i/nodes)*ball.yV*ballSpd;
                    let distXright0=distXright-(i/nodes)*ball.yV*ballSpd;

                    if (distYbot0-ballR/2-cellBorderWidth<0 && distYtop0+ballR/2+cellBorderWidth>0) {
                        if (distXleft0+ballR/2>0 && distXright0-ballR/2-cellBorderWidth<0) {
                            col = true;
                            break;
                        }
                    }
                }
                
                if (col) {
                    cell.power-=1;
                    drawGrid();

                    distYbot = Math.abs(distYbot);
                    distYtop = Math.abs(distYtop);
                    distXleft = Math.abs(distXleft);
                    distXright = Math.abs(distXright);
                    
                    if (ball.yV>0)
                        distYbot=2^30;
                    else
                        distYtop=2^30;

                    if (ball.xV>0)
                        distXright=2^30;
                    else
                        distXleft=2^30;
                    
                    let max = Math.min(distYbot,distYtop,distXleft,distXright);

                    switch(max) {
                        case distYbot:
                            if (ball.yV<0)
                                ball.yV*=-1;
                            ball.y=origY+unit*r+unit+ballR/2+cellBorderWidth*2;
                            break;
                        case distYtop:
                            if (ball.yV>0)
                                ball.yV*=-1;
                            ball.y=origY+unit*r-ballR/2-cellBorderWidth*2;
                            break;
                        case distXleft:
                            if (ball.xV>0)
                                ball.xV*=-1;
                            ball.x=origX+unit*c-ballR/2-cellBorderWidth*2;
                            break;
                        case distXright:
                            if (ball.xV<0)
                                ball.xV*=-1;
                            ball.x=origX+unit*c+unit+ballR/2+cellBorderWidth*2;
                            break;
                    }
                    bounced=true;
                }
            }
        }
    }
}

function isEmpty() {
    let empty = true;
    for (let r=0;r<grid.length;r++) {
        if(!empty)break;
        for (let c=0;c<grid.at(r).length;c++) {
            if (grid.at(r).at(c).power>0) {
                empty=false;
                break;
            }
        }
    }
    return empty;
}

app.ticker.add((ticker) => {
    let d = ticker.deltaTime
    elapsed += d/60;
    let difficulty=elapsed;

    if (true) {
        timer-=d/60;
    }

    if (ballsOut.length>0) {
        console.log(ballsOut.at(0).xV+" "+ballsOut.at(0).yV)
    }

    if (toBeLaunched.at(2)>0 && lastLaunchTime+cooldown<elapsed) {
        console.log('bam');

        let x = toBeLaunched.at(0);
        let y = toBeLaunched.at(1);

        let abs = Math.sqrt(x*x+y*y);
        ballsOut.push({
            x:ballX,
            y:ballY,
            xV:x/abs,
            yV:y/abs
        });

        toBeLaunched[2]--;
        lastLaunchTime=elapsed;
        if (toBeLaunched[2]<=0) {
            toBeLaunched=[0,0,0]
        }
    }

    for (let i=0;i<ballsOut.length;i++) {
        let ball = ballsOut.at(i);

        let abs = 1;//Math.sqrt(ball.xV*ball.xV+ball.yV*ball.yV);
        let v = [ball.xV/abs, ball.yV/abs];
        ball.x+=v.at(0)*d*ballSpd;
        ball.y+=v.at(1)*d*ballSpd;
        
        ballCheck(ball);
    }

    if (timer<=0 && ballsOut.length<=0) {

        let lastRow = grid.at(-2);
        for (let i=0;i<lastRow.length;i++) {
            if (lastRow.at(i).power>0) {
                initAll();
                return;
            }
        }

        //timerD/=1.004;
        timer=Math.min(timerD, timer+timerD*2);

        ballsIn+=1;

        do {
            for (let r=grid.length-1; r>0;r--) {
                grid[r]=grid[r-1];
            }
            let r = [];
            for(let c=0;c<grid.at(0).length;c++) {
                let cell = {
                    power: 0,
                    type: 0
                };
                if (Math.floor(Math.random()*(4+difficulty/90)-2)>0) {
                    cell.power = Math.ceil(Math.random()*(difficulty/10+1)+difficulty/5)
                }
                r.push(cell)
            }   
            grid[0]=r;
        } while(isEmpty());
        
        drawGrid();
    }
    drawBalls();
});

initAll();
