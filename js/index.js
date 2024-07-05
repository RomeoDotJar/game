//const PIXI = require('pixi.js')

let version = 'v1.08.1: Optimization Update!';
console.log(version);

const app = new PIXI.Application()
await app.init({
    resizeTo:window,
    backgroundAlpha:0,
    antialias: false,
    transparent: false,
    resolution: 1
});
//console.log(document.body.getElementsByClassName('canvas'))
document.body.appendChild(app.canvas);

function w(f) {
    return app.canvas.width*f
}
function h(f) {
    return app.canvas.height*f
}

const fnts = ['Arial','Verdana','Tahoma','Trebuchet MS','Times New Roman','Georgia','Garamond','Courier New','Brush Script MT'];

const cellTypes = [
    {id:'basic',w:1000},
    {id:'bombRow',w:75},
    {id:'bombCol',w:75}
]
var cellFont = fnts.at(0);

var attempts = 0;
var hs = 0;
var lastScore = 0;
var score = 0;

var wg = 0;
var hg = 0;

var unit = 0;
var hgOffset = 0;

var origX = 0;
var origY = 0;

var midX = 0;

var ballX = 0;
var ballY = 0;

var ftsz=0;

var ballSpdB=60;

function updSizes() {
    wg = grid.at(0).length;
    hg = grid.length;

    unit = Math.min(h(.75/hg), w(.8/wg));
    hgOffset = -h(.05);

    origX = w(.5)-unit*wg/2;
    origY = h(.5)-unit*hg/2+hgOffset;

    midX = origX+unit*wg/2;

    //ballX = midX;
    ballY = origY+unit*hg-unit*.5;
    
    ballR = unit/7;

    ballSpd = ballSpdB*unit;

    ftsz = Math.min(w(1)/13,h(1)/27);
}

await PIXI.Assets.load('img/ball.png');
let ball = PIXI.Sprite.from('img/ball.png');

app.stage.addChild(ball);

var scoreT;
var versionT;

var runT;
var bestST;
var lastST;

var cellTs = [];

function setupText() {
    const vt0 = new PIXI.BitmapText({
        text: version,
        style: {
            fontFamily: fnts.at(7),
            fontSize: ftsz,
            align: 'left',
        }
    });
    vt0.tint=0x000000;
    vt0.x=10+ftsz/16;
    vt0.y=h(1)-ftsz+ftsz/16;
    //app.stage.getChildByLabel('guiTexts').addChild(vt0);
    const vt = new PIXI.BitmapText({
        text: version,
        style: {
            fontFamily: fnts.at(7),
            fontSize: ftsz,
            align: 'left',
        }
    });
    vt.x=10;
    vt.y=h(1)-ftsz;

    scoreT = [vt0, vt];
    app.stage.getChildByLabel('guiTexts').addChild(vt0);
    app.stage.getChildByLabel('guiTexts').addChild(vt);

    let yOffset = Math.sin(scoreTick*.2+elapsed*2)*ftsz/11;
    let xOffset = Math.cos(scoreTick*.2+elapsed)*ftsz/4;

    let rOffset = Math.sin(scoreTick*.3+elapsed)/10;

    const st0 = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    st0.tint=0x000000;
    st0.x=midX+xOffset*1.2;
    st0.y=origY-ftsz*1.2+ftsz/12+yOffset;
    st0.rotation=rOffset;
    st0.anchor.set(.5,.5);
    const st = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    st.x=midX+xOffset;
    st.y=origY-ftsz*1.2+yOffset;
    st.rotation=rOffset;
    st.anchor.set(.5,.5);

    scoreT = [st0, st];
    app.stage.getChildByLabel('guiTexts').addChild(st0);
    app.stage.getChildByLabel('guiTexts').addChild(st);

    const gt = new PIXI.BitmapText({
        text: 'Run #'+attempts,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'center',
        }
    });
    gt.alpha=1;
    gt.anchor.set(.5,.5);
    gt.y=origY+unit*hg/2-ftsz*2;
    gt.x=midX;
    const lst = new PIXI.BitmapText({
        text: 'last score: '+lastScore,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'left',
        }
    });
    lst.alpha=1;
    lst.anchor.set(0,.5);
    lst.y=origY+unit*hg/2;
    lst.x=origX+unit;
    const hst = new PIXI.BitmapText({
        text: 'best score: '+hs,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'left',
        }
    });
    hst.alpha=1;
    hst.anchor.set(0,.5);
    hst.y=origY+unit*hg/2+ftsz*1.3;
    hst.x=origX+unit;

    bestST=hst;
    lastST=lst;
    runT=gt;
    app.stage.getChildByLabel('guiTexts').addChild(gt);
    app.stage.getChildByLabel('guiTexts').addChild(lst);
    app.stage.getChildByLabel('guiTexts').addChild(hst);

    for(let r=0;r<grid.length;r++){
        let row = [];
        for(let c=0;c<grid.at(r).length;c++){
            let t = new PIXI.BitmapText({
                text: '',
                style: {
                    fontFamily: cellFont,
                    fontSize: ftsz,
                    align: 'center',
                }
            });
            t.alpha=0;
            t.anchor.set(.5,.5);

            row.push(t);
            app.stage.getChildByLabel('cellTexts').addChild(t);
        }
        cellTs.push(row);
    }
}

let elapsed = 0.0;

let ballTick = 0.0;
let ballsIn = 1;

let gridW = Math.floor(Math.random()*5)+5;
let gridH = 10;

let row = [];
let grid = [];
for (let i=0;i<gridW;i++) {
    row.push({
        power: 0,
        type: 0
    });
}
for (let i=0;i<gridH;i++) {
    grid.push(row);
}

let timerD=4;
let timer=1;
let ballsOut = [];// {}

let ballR = 10;
let ballSpd = 12;

let toBeLaunched = [0,0,0];
let aimVector = [0,0];

let md = false;

let pointerX=0;
let pointerY=0;

function launch() {
    if (ballsIn>0 && Math.abs(aimVector[0])+Math.abs(aimVector[1])>50) {
        toBeLaunched = [-aimVector[0],-aimVector[1],ballsIn];
        ballsIn=0;
    }
    aimVector = [0,0];
}

function aim() {
    let y = pointerY-origY-unit*hg+unit*.5;

    aimVector = [pointerX-ballX, Math.max(3, Math.abs(y))];
    if (y<0) {
        aimVector[0]*=-1;
    }
}

app.stage.eventMode = 'static'
app.stage.ontouchstart = (event) => {
    md=true;
    pointerX=event.x;
    pointerY=event.y;
}
app.stage.ontouchmove = (event) => {
    pointerX=event.x;
    pointerY=event.y;
}
app.stage.ontouchend = (event) => {
    md=false;
    launch();
}
app.stage.ontouchcancel = (event) => {
    aimVector = [0,0];
    md=false;
}
app.stage.onmousedown = (event) => {
    md=true;
    pointerX=event.x;
    pointerY=event.y;
}
app.stage.onmousemove = (event) => {
    pointerX=event.x;
    pointerY=event.y;
}
app.stage.onmouseup = (event) => {
    md=false;
    launch();
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

var guiTexts = new PIXI.Container();
guiTexts.label='guiTexts';
app.stage.addChild(guiTexts);

var ballsC = new PIXI.Container();
ballsC.label='balls';
app.stage.addChild(ballsC);

var lastLaunchTime = 0;
var cooldown = 0.1;

var maxDist = 300;

var round=0;
var scoreTick=0;

var scoreTScale=1;

function initAll() {
    attempts++;
    lastScore=Math.floor(score);
    hs=Math.max(hs,lastScore);
    score = 0;
    scoreTick=0;
    elapsed = 0.0;

    ballTick = 0.0;
    ballsIn = 1;

    gridW = Math.floor(Math.random()*5)+5;
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
    round=0;
    ballsOut = [];// {}

    ballSpdB=12;

    toBeLaunched = [0,0,0];
    aimVector = [0,0];
    
    lastLaunchTime = 0;
    cooldown = 0.1;

    maxDist = 300;

    cellFont = fnts.at(Math.floor(Math.random()*(fnts.length)));

    drawGrid();
}

//const PIXI = require('pixi.js')

function drawGui(d) {
    if (elapsed<timerD*3) {
        let a = Math.max(0, Math.min(1, 1.25-(elapsed/timerD/2)));
        a=Math.sqrt(a);

        runT.alpha=a;
        bestST.alpha=a;
        lastST.alpha=a;
    }

    let yOffset = Math.sin(scoreTick*.2+elapsed*2)*ftsz/11;
    let xOffset = Math.cos(scoreTick*.2+elapsed)*ftsz/4;

    let rOffset = Math.sin(scoreTick*.3+elapsed)/10;

    scoreT[0].text='счёт: '+Math.floor(score)
    scoreT[0].style.fontSize=ftsz*(1+Math.min(2,scoreTScale));
    scoreT[0].x=midX+xOffset*1.2;
    scoreT[0].y=origY-ftsz*1.2+ftsz/12+yOffset;
    scoreT[0].rotation=rOffset;
    
    scoreT[1].text='счёт: '+Math.floor(score)
    scoreT[1].style.fontSize=ftsz*(1+Math.min(2,scoreTScale));
    scoreT[1].x=midX+xOffset;
    scoreT[1].y=origY-ftsz*1.2+yOffset;
    scoreT[1].rotation=rOffset;
    scoreT[1].anchor.set(.5,.5);

    scoreTScale-=Math.min(1,scoreTScale*6*d);
}

function drawCells(d) {
    graph
      .clear();

    graph
      .roundRect(origX-borderWidth, origY-borderWidth, wg*unit+borderWidth*2, hg*unit+borderWidth*2, cornerRadius)
      .fill(0xffffff,.8)
      .roundRect(origX, origY, wg*unit, hg*unit, cornerRadius)
      .fill(0x131320,.95);

    for (let i = 0; i<grid.length; i++) {
        for (let c = 0; c<grid.at(i).length; c++) {
            let cell = grid.at(i).at(c);
            let text = cellTs[i][c];

            if (cell.power>0) {
                let cellBorderCol=0xFFFFFF;
                let cellFlashCol=0xFFFFFF;
                let cellTextCol=0xFFFFFF;
                let cellCol0=0x000000;
                let cellCol1=0x000000;

                switch (cell.type) {
                    case 'basic':
                        cellCol0=0x000011;
                        cellCol1=0x131320;
                        break;
                    case 'bombCol':
                    case 'bombRow':
                        cellCol0=0x000011;
                        cellCol1=0xAA2255;
                        cellFlashCol=0xFF2255;
                        break;
                }
                if (text!=undefined) {
                    text.alpha=1;
                    text.groupColor=cellTextCol;
                    text.text=cell.power;
                    text.x=origX+unit/2+unit*c;
                    text.y=origY+unit/2+unit*i;
                }

                graph
                  .rect(
                      origX-cellBorderWidth+unit*c, origY-cellBorderWidth+unit*i, unit+cellBorderWidth*2, unit+cellBorderWidth*2)
                  .fill(cellBorderCol)
                  .rect(
                      origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i, unit-cellGap-cellBorderWidth*2, unit-cellGap-cellBorderWidth*2)
                  .fill(cellCol0);
                
                switch (cell.type) {
                    case 'bombCol':
                        // vertical line with col1
                        graph
                          .rect(
                            origX+cellBorderWidth+cellGap/2+unit*c+unit*.25, origY+cellBorderWidth+cellGap/2+unit*i, unit-cellGap-cellBorderWidth*2-unit*.5, unit-cellGap-cellBorderWidth*2)
                          .fill(cellCol1);
                        break;
                    case 'bombRow':
                        graph
                          .rect(
                            origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i+unit*.25, unit-cellGap-cellBorderWidth*2, unit-cellGap-cellBorderWidth*2-unit*.5)
                          .fill(cellCol1);
                        // horizontal line with col1
                        break;
                    default:
                        graph
                          .poly([
                            new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i),
                            new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*i),
                            new PIXI.Point(origX+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*c, origY+cellBorderWidth+cellGap/2+unit-cellGap-cellBorderWidth*2+unit*i)
                            ])
                          .fill(cellCol1);
                }

                graph
                  .rect(
                      origX+cellBorderWidth+cellGap/2+unit*c, origY+cellBorderWidth+cellGap/2+unit*i, unit-cellGap-cellBorderWidth*2, unit-cellGap-cellBorderWidth*2)
                  .fill(cellFlashCol,cell.flash);
            }
            else {
                if (text!=undefined) {
                    text.alpha=1;
                    text.text='';
                }
            }
            if (cell.flash>0) {
                cell.flash=Math.max(0, cell.flash-d*2.6);
            }
        }
    }
}

function drawGrid() {
    ball.anchor.set(.5,.5);
    ball.y=h(.5);
    ball.x=w(.3);

    updSizes();
}
drawGrid();

let deltaX0=0;
let deltaY0=0;
let smoothing=3;
function drawBalls(d) {
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
              .circle(ballX+dX, ballY+dY, (3+4.5*(1-dist0/usedDist))*ballR/10)
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

function addScore(pts) {
    score+=pts;
    scoreTick+=pts;
    scoreTScale+=.05*Math.min(pts, 5);
}

function hit(ball, cell, dmg) {
    cell.power-=dmg;
    cell.flash=Math.min(.7, cell.flash+dmg*.4);
    if (cell.power<=0) {
        switch (cell.type) {
            case 'basic':
                addScore(1);
                break;
            case 'bombCol':
                for (let r=0;r<grid.length;r++) {
                    if (r!=cell.r) {
                        let cell0 = grid.at(r).at(cell.c);
                        if (cell0.power>0) {
                            let atk = Math.min(cell0.power-(cell0.type=='basic'?1:0));
                            hit(null, cell0, atk);
                        }
                    }
                }
                break;
            case 'bombRow':
                for (let c=0;c<grid.at(cell.r).length;c++) {
                    if (c!=cell.c) {
                        let cell0 = grid.at(cell.r).at(c);
                        if (cell0.power>0) {
                            let atk = Math.min(cell0.power-(cell0.type=='basic'?1:0));
                            hit(null, cell0, atk);
                        }
                    }
                }
                break;
        }
    }
    addScore(dmg);
}

function ballCheck(ball) {
    if (ball.y>=origY+hg*unit) {
        //console.log('pop');
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
                let nodes = 3;

                let distYbot0=0;
                let distYtop0=0;
                let distXleft0=0;
                let distXright0=0;

                let posX = ball.x;
                let posY = ball.y;

                for (let i = nodes; i>=0; i--) {

                    posX = (ball.x*(nodes-i)+ball.x0*i)/nodes;
                    posY = (ball.y*(nodes-i)+ball.y0*i)/nodes;

                    distYbot0=distYbot-ball.y+posY;
                    distYtop0=distYtop-ball.y+posY;
                    distXleft0=distXleft-ball.x+posX;
                    distXright0=distXright-ball.x+posX;

                    if (distYbot0-ballR/2-cellBorderWidth*2<0 && distYtop0+ballR/2+cellBorderWidth*2>0) {
                        if (distXleft0+ballR/2+cellBorderWidth*2>0 && distXright0-ballR/2-cellBorderWidth*2<0) {
                            col = true;
                            break;
                        }
                    }
                }

                ball.x = posX;
                ball.y = posY;
                
                if (col) {
                    hit(ball, cell, 1);
                    //drawGrid();

                    distYbot = Math.abs(distYbot0);
                    distYtop = Math.abs(distYtop0);
                    distXleft = Math.abs(distXleft0);
                    distXright = Math.abs(distXright0);
                    
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
                            if (r+1>=grid.length || grid.at(r+1).at(c).power<=0) {
                                if (ball.yV<0)
                                    ball.yV*=-1;
                                ball.y=origY+unit*r+unit+ballR+cellBorderWidth*2;
                            }
                            break;
                        case distYtop:
                            if (r-1<0 || grid.at(r-1).at(c).power<=0) {
                                if (ball.yV>0)
                                    ball.yV*=-1;
                                ball.y=origY+unit*r-ballR-cellBorderWidth*2;
                            }
                            break;
                        case distXleft:
                            if (c-1<0 || grid.at(r).at(c-1).power<=0) {
                                if (ball.xV>0)
                                    ball.xV*=-1;
                                ball.x=origX+unit*c-ballR-cellBorderWidth*2;
                            }
                            break;
                        case distXright:
                            if (c+1>=grid.at(r).length || grid.at(r).at(c+1).power<=0) {
                                if (ball.xV<0)
                                    ball.xV*=-1;
                                ball.x=origX+unit*c+unit+ballR+cellBorderWidth*2;
                            }
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

let ticks = 0;
app.ticker.add((ticker) => {
    let d = ticker.deltaTime/60;
    elapsed += d;
    let difficulty=elapsed;

    if (true) {
        ticks++;
        timer-=d;
    }

    if (md) aim();

    if(!md && ballsOut<=0) {
        
    }

    if (toBeLaunched.at(2)<=0 && ballsIn>0) {
        ballTick+=d;
        ballX = midX;//+Math.sin(ballTick)*unit*wg/3;
    }

    if (toBeLaunched.at(2)>0 && lastLaunchTime+cooldown<elapsed) {
        //console.log('bam');

        let x = toBeLaunched.at(0);
        let y = toBeLaunched.at(1);

        let abs = Math.sqrt(x*x+y*y);
        ballsOut.push({
            x:ballX,
            y:ballY,
            xV:x/abs,
            yV:y/abs,
            x0:ballX,
            y0:ballY
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
        ball.x0=ball.x;
        ball.y0=ball.y;
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
        timer=Math.min(timerD, Math.max(-timerD*6, timer+timerD*2));
        round++;

        addScore(Math.floor(Math.sqrt(round)));

        ballsIn+=1;

        do {
            for (let r=grid.length-1; r>0;r--) {
                grid[r]=grid[r-1];
                for (let c=0;c<grid.at(r).length;c++)
                    grid.at(r).at(c).r+=1;
            }
            let r = [];
            for(let c=0;c<grid.at(0).length;c++) {
                let cell = {
                    power: 0,
                    type: '',
                    c: c,
                    r: 0,
                    flash: 0
                };
                if (Math.floor(Math.random()*(4+difficulty/90)-2)>0) {
                    cell.power = Math.ceil(Math.random()*(difficulty/10+1)+difficulty/5);

                    let maxW = 0;
                    for (let i=0;i<cellTypes.length;i++) maxW+=cellTypes.at(i).w;

                    let roll = Math.floor(Math.random()*maxW);
                    let margin = 0;
                    for (let i=0;i<cellTypes.length;i++) {
                        let type = cellTypes.at(i);
                        margin+=type.w;
                        if (roll<margin) {
                            cell.type=type.id;
                            break;
                        }
                    }
                    
                    switch(cell.type) {
                        case 'bombRow':
                        case 'bombCol':
                            cell.power=Math.ceil(cell.power/3);
                            break;
                    }
                }
                r.push(cell);
            }   
            grid[0]=r;
        } while(isEmpty());

        drawGrid();
    }
    drawCells(d);
    drawBalls(d);
    drawGui(d);
    
    if (ticks%60==0)
        console.log(window.performance.memory);
});

initAll();
setupText();
