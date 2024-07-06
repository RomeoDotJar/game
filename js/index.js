//const PIXI = require('pixi.js')

const version = 'v1.10';
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

function getEmptyCell(r,c) {
    return {
        power:0,
        type:'',
        flash:0,
        r:r,
        c:c,
        dead:true,
        hitBy:undefined
    }
}

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
var ftszcell=0;

var ballSpdB;

function updSizes() {
    wg = grid.at(0).length;
    hg = grid.length;

    unit = Math.min(h(.67/hg), w(.8/wg));
    hgOffset = -h(.05);

    origX = w(.5)-unit*wg/2;
    origY = h(.5)-unit*hg/2+hgOffset;

    midX = origX+unit*wg/2;

    //ballX = midX;
    ballY = origY+unit*hg-unit*.5;
    
    ballR = unit/7;

    ballSpd = ballSpdB*unit;

    ftsz = Math.min(w(1)/13,h(1)/27);

    ftszcell = Math.max(w(1)*.15,h(1)*.3);
    ftszcell = ftszcell/Math.min(wg,hg);

    updateText();
}

await PIXI.Assets.load('img/ball.png');
let ball = PIXI.Sprite.from('img/ball.png');

app.stage.addChild(ball);

var scoreT;
var versionT;
var rowsToAddT;

var runT;
var bestST;
var lastST;

var cellTs = [];

function fillGrid() {
    for (let r=0;r<gridH;r++) {
        if (grid.at(r)==undefined) {
            grid[r]=[]
        }
        for (let c=0;c<gridW;c++) {
            if (grid[r][c]==undefined) {
                grid[r][c]=getEmptyCell(r,c);
            }
        }
    }
    updSizes();
}

function fillCellTs() {
    console.log(cellTs);
    for(let r=0;r<gridH;r++){
        if (cellTs[r]==undefined)
            cellTs[r]=[];
        for(let c=0;c<gridW;c++){
            if (cellTs[r][c]==undefined) {
                let t = new PIXI.BitmapText({
                    text: '',
                    style: {
                        fontFamily: cellFont,
                        fontSize: ftszcell,
                        align: 'center',
                    }
                });
                t.alpha=0;
                t.anchor.set(.5,.5);

                cellTs[r][c]=t;
                app.stage.getChildByLabel('cellTexts').addChild(t);
            }
        }
    }
}

function updateText() {
    versionT[0].style.fontSize=ftsz;
    versionT[0].x=10;
    versionT[0].y=h(1)-ftsz-ftsz/16-10;
    
    versionT[1].style.fontSize=ftsz;
    versionT[1].x=10;
    versionT[1].y=h(1)-ftsz-10;

    runT.style.fontSize=ftsz;
    runT.y=origY+unit*hg/2-ftsz*2;
    runT.x=midX;

    lastST.style.fontSize=ftsz;
    lastST.y=origY+unit*hg/2;
    lastST.x=origX+ftsz/2;

    bestST.style.fontSize=ftsz;
    bestST.y=origY+unit*hg/2+ftsz*1.3;
    bestST.x=origX+ftsz/2;
}

function setupText() {
    app.stage.getChildByLabel('guiTexts').removeChildren();
    app.stage.getChildByLabel('cellTexts').removeChildren();
    
    // version TEXT
    const vt0 = new PIXI.BitmapText({
        text: version,
        style: {
            fontFamily: fnts.at(7),
            fontSize: ftsz,
            align: 'left',
        }
    });
    vt0.tint=0x000000;
    //app.stage.getChildByLabel('guiTexts').addChild(vt0);
    const vt = new PIXI.BitmapText({
        text: version,
        style: {
            fontFamily: fnts.at(7),
            fontSize: ftsz,
            align: 'left',
        }
    });

    versionT = [vt0, vt];
    app.stage.getChildByLabel('guiTexts').addChild(vt0);
    app.stage.getChildByLabel('guiTexts').addChild(vt);

    // score TEXT
    const st0 = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    st0.tint=0x000000;
    st0.anchor.set(.5,.5);
    const st = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    st.anchor.set(.5,.5);

    scoreT = [st0, st];
    app.stage.getChildByLabel('guiTexts').addChild(st0);
    app.stage.getChildByLabel('guiTexts').addChild(st);

    // rows to be added TEXT
    const rtat0 = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    rtat0.tint=0x000000;
    rtat0.anchor.set(.5,.5);
    const rtat = new PIXI.BitmapText({
        text: 'счёт: '+Math.floor(score),
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz*(1+Math.min(2,scoreTScale)),
            align: 'center',
        }
    })
    rtat.anchor.set(.5,.5);

    rowsToAddT = [rtat0, rtat];
    app.stage.getChildByLabel('guiTexts').addChild(rtat0);
    app.stage.getChildByLabel('guiTexts').addChild(rtat);

    const gt = new PIXI.BitmapText({
        text: 'Забег №'+attempts,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'center',
        }
    });
    gt.anchor.set(.5,.5);
    const lst = new PIXI.BitmapText({
        text: 'прошлая игра: '+lastScore,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'left',
        }
    });
    lst.anchor.set(0,.5);
    const hst = new PIXI.BitmapText({
        text: 'личный рекорд: '+hs,
        style: {
            fontFamily: fnts.at(1),
            fontSize: ftsz,
            align: 'left',
        }
    });
    hst.anchor.set(0,.5);

    bestST=hst;
    lastST=lst;
    runT=gt;
    app.stage.getChildByLabel('guiTexts').addChild(gt);
    app.stage.getChildByLabel('guiTexts').addChild(lst);
    app.stage.getChildByLabel('guiTexts').addChild(hst);

    cellTs=[];
    fillCellTs();

    updateText();
}

let elapsed = 0.0;

let ballTick = 0.0;
let ballsIn = 1;

let gridW = Math.floor(Math.random()*5)+5;
let gridH = Math.floor(Math.random()*4)+8;

let row = [];
let grid = [];

let rowsToAdd=0;
let ballsOut = [];// {}

let ballR = 10;
let ballSpd;

let toBeLaunched = [0,0,0];
let aimVector = [0,0];

let md = false;

let pointerX=0;
let pointerY=0;

function launch() {
    if (ballsIn>0 && Math.abs(aimVector[0])+Math.abs(aimVector[1])>50 && toBeLaunched[2]<=0) {
        toBeLaunched = [-aimVector[0],-aimVector[1],ballsIn];
        ballsIn=0;
        rowsToAdd++;
        rtaTick++;
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
var cooldown;

var maxDist = 300;

var round=0;
var scoreTick=0;
var rtaTick=0;

var scoreTScale=1;

function initAll() {
    attempts++;
    lastScore=Math.floor(score);
    hs=Math.max(hs,lastScore);
    score = 0;
    scoreTick=0;
    rtaTick=0;
    elapsed = 0.0;

    ballTick = 0.0;
    ballsIn = 1;//1;

    gridW = 5;
    gridH = 8;

    row = [];
    grid = [];

    rowsToAdd=1;
    round=0;
    ballsOut = [];// {}

    ballSpdB=13;

    toBeLaunched = [0,0,0];
    aimVector = [0,0];
    
    lastLaunchTime = 0;
    cooldown = 0.1;//0.1;

    maxDist = 300;

    cellFont = fnts.at(Math.floor(Math.random()*(fnts.length)));

    setupText();
    fillGrid();
    fillCellTs();
    drawGrid();
}

//const PIXI = require('pixi.js')

function drawGui(d) {
    if (round<=3) {
        let a = Math.max(0, Math.min(1, 1.25-(round/2)));
        a=Math.sqrt(a);

        runT.alpha=a;
        bestST.alpha=a;
        lastST.alpha=a;
    }

    let yOffset;
    let xOffset;
    let rOffset;

    // score text
    yOffset = Math.sin(scoreTick*.2+elapsed*2)*ftsz/11;
    xOffset = Math.cos(scoreTick*.2+elapsed)*ftsz/4;

    rOffset = Math.sin(scoreTick*.3+elapsed)/10;

    scoreT[0].text='счёт: '+Math.floor(score)
    scoreT[0].style.fontSize=ftsz*.95*(1+Math.min(2,scoreTScale));
    scoreT[0].x=midX+xOffset*1.2;
    scoreT[0].y=origY-ftsz*1.2+ftsz/13+yOffset;
    scoreT[0].rotation=rOffset;
    
    scoreT[1].text='счёт: '+Math.floor(score)
    scoreT[1].style.fontSize=ftsz*.95*(1+Math.min(2,scoreTScale));
    scoreT[1].x=midX+xOffset;
    scoreT[1].y=origY-ftsz*1.2+yOffset;
    scoreT[1].rotation=rOffset;

    scoreTScale-=Math.min(1,scoreTScale*6*d);

    // RTA text
    yOffset = Math.cos(rtaTick*.2+elapsed)*ftsz/20;
    xOffset = Math.sin(rtaTick*.2+elapsed/2)*ftsz/8-ftsz*.1;

    rOffset = Math.cos(rtaTick*.3+elapsed)/20-.1;

    let rowsToAddTScale=Math.abs(Math.sin(rtaTick*.3+elapsed*(3+rtaTick/80)))*.15;
    let dangerStr='';

    let danger = rowsToAdd;
    while (danger>0) {
        danger--;
        dangerStr+='I';
    }
    let power = Math.min(1, (rowsToAdd-1)/hg);

    rowsToAddT[0].text='опасность:\n'+dangerStr;
    rowsToAddT[0].style.fontSize=ftsz*.75*(1+Math.min(2,rowsToAddTScale));
    rowsToAddT[0].groupColor=new PIXI.Color({r:255*power,g:0,b:0}).toBgrNumber();
    rowsToAddT[0].x=origX+unit*wg-unit/4+xOffset*1.2;
    rowsToAddT[0].y=origY-ftsz*1.7+ftsz/13.7+yOffset;
    rowsToAddT[0].rotation=rOffset;
    
    rowsToAddT[1].text='опасность:\n'+dangerStr;
    rowsToAddT[1].style.fontSize=ftsz*.75*(1+Math.min(2,rowsToAddTScale));
    rowsToAddT[1].groupColor=new PIXI.Color({r:255,g:255*(1-power),b:255*(1-power)}).toBgrNumber();
    rowsToAddT[1].x=origX+unit*wg-unit/4+xOffset;
    rowsToAddT[1].y=origY-ftsz*1.7+yOffset;
    rowsToAddT[1].rotation=rOffset;
}

//const PIXI = require('pixi.js');

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

            let cellFlashCol=0xFFFFFF;
            let cellBorderCol=0xFFFFFF;
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

            if (cell.power>0) {
                if (text!=undefined) {
                    text.alpha=1;
                    text.groupColor=cellTextCol;
                    text.text=cell.power;
                    if (text.style!=undefined)
                        text.style.fontSize=ftszcell;
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
            }
            else {
                if (text!=undefined) {
                    text.alpha=1;
                    text.text='';
                }
            }
            if (cell.flash>0) {
                graph
                  .rect(
                      origX+cellBorderWidth/2+cellGap/2+unit*c, origY+cellBorderWidth/2+cellGap/2+unit*i, unit-cellGap-cellBorderWidth, unit-cellGap-cellBorderWidth)
                  .fill(cellFlashCol,cell.flash);
                cell.flash=Math.max(0, cell.flash-d*2.6);
                if (cell.flash<=0 && cell.power<=0)
                    cell.type='';
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

let deltaX0=0;
let deltaY0=0;
let smoothing=3;
function drawBalls(d) {
    app.stage.getChildByLabel('balls').removeChildren();

    graphBalls.clear();
    
    for (let i=0;i<ballsOut.length;i++) {
        let ball = ballsOut.at(i);
        let x = ball.x;
        let y = ball.y;
        let xV = ball.xV;
        let yV = ball.yV;

        let x0 = ball.x0;
        let y0 = ball.y0;
        let x1 = ball.x1;
        let y1 = ball.y1;
        let x2 = ball.x2;
        let y2 = ball.y2;
        let x3 = ball.x3;
        let y3 = ball.y3;
        
        let graphicsLevel = 8-ballsOut.length/100;

        

        if (graphicsLevel>0) graphBalls.circle((x+x0)/2,(y+y0)/2,ballR);
        if (graphicsLevel>1) graphBalls.circle(x0,y0,ballR*.95);
        if (graphicsLevel>2) graphBalls.circle((x1+x0)/2,(y1+y0)/2,ballR*.85);
        if (graphicsLevel>3) graphBalls.circle(x1,y1,ballR*.75);
        if (graphicsLevel>4) graphBalls.circle((x2+x1)/2,(y2+y1)/2,ballR*.65);
        if (graphicsLevel>5) graphBalls.circle(x2,y2,ballR*.55);
        if (graphicsLevel>6) graphBalls.circle((x3+x2)/2,(y3+y2)/2,ballR*.45);
        if (graphicsLevel>7) graphBalls.circle(x3,y3,ballR*.35);
        graphBalls
          .fill(0x505050);
    }
    for (let i=0;i<ballsOut.length;i++) {
        let ball = ballsOut.at(i);
        let x = ball.x;
        let y = ball.y;
        
        graphBalls
          .circle(x, y, ballR)
          .fill(0xFFFFFF);
    }

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

function special(cell) {
    switch (cell.type) {
        case 'basic':
            addScore(1);
            break;
        case 'bombCol':
            for (let r=0;r<grid.length;r++) {
                if (r!=cell.r) {
                    let cell0 = grid.at(r).at(cell.c);
                    let debuff = (cell0.power>0?(cell0.type.includes('bomb')?0:(cell0.power>1?1:0)):-100);
                    let atk = Math.min(cell0.power-debuff);
                    hit(undefined, cell0, atk);
                }
            }
            break;
        case 'bombRow':
            for (let c=0;c<grid.at(cell.r).length;c++) {
                if (c!=cell.c) {
                    let cell0 = grid.at(cell.r).at(c);
                    let debuff = (cell0.power>0?(cell0.type.includes('bomb')?0:(cell0.power>1?1:0)):-100);
                    let atk = Math.max(0, Math.min(cell0.power-debuff));
                    hit(undefined, cell0, atk);
                }
            }
            break;
    }
}

function hit(ball, cell, dmg) {
    cell.hitBy=ball;
    let power0= cell.power;
    cell.power=Math.max(0, cell.power-dmg);
    cell.flash=Math.min(.7, cell.flash+dmg*.3+.1);
    addScore(Math.max(0,power0-cell.power));
}

function ballCheck(ball) {
    if (ball.y>=origY+hg*unit) {
        //console.log('pop');
        ballsIn++;
        ballsOut.splice(ballsOut.indexOf(ball), 1);
        return;
    }

    if (ball.y-ballR<origY) {
        ball.yV*=-1;
        ball.y=origY+ballR;
    }
    if (ball.x-ballR<origX) {
        ball.xV*=-1;
        ball.x=origX+ballR;
    }
    else if (ball.x+ballR>origX+wg*unit) {
        ball.xV*=-1;
        ball.x=origX+wg*unit-ballR;
    }

    let bounced=false;
    for (let r=0;r<grid.length;r++) {
        if(bounced)break;
        for (let c=0;c<grid.at(r).length;c++) {
            if(bounced)break;
            let cell = grid.at(r).at(c);
            if (cell.power>0) {
                let distYbot=-origY-unit*r-unit-ballR/2-cellBorderWidth*2;
                let distYtop=-origY-unit*r+ballR/2+cellBorderWidth*2;
                let distXleft=-origX-unit*c+ballR/2+cellBorderWidth*2;
                let distXright=-origX-unit*c-unit-ballR/2-cellBorderWidth*2;
                
                let col = false;
                let nodes = 4;

                let distYbot0=0;
                let distYtop0=0;
                let distXleft0=0;
                let distXright0=0;

                let posX = ball.x;
                let posY = ball.y;

                let i = 0;

                for (i = nodes-1; i>=0; i--) {

                    posX = (ball.x*(nodes-i)+ball.x0*i)/nodes;
                    posY = (ball.y*(nodes-i)+ball.y0*i)/nodes;

                    if (posX+ballR+cellBorderWidth>origX+unit*c &&
                        posX-ballR-cellBorderWidth<origX+unit*c+unit &&
                        posY+ballR+cellBorderWidth>origY+unit*r &&
                        posY-ballR-cellBorderWidth<origY+unit*r+unit                        
                    ) {
                        distYbot0=distYbot+posY;
                        distYtop0=distYtop+posY;
                        distXleft0=distXleft+posX;
                        distXright0=distXright+posX;

                        col = true;
                        break;
                    }
                }
                
                if (col) {
                    hit(ball, cell, 1);
                    //drawGrid();

                    distYbot = Math.abs(distYbot0);
                    distYtop = Math.abs(distYtop0);
                    distXleft = Math.abs(distXleft0);
                    distXright = Math.abs(distXright0);
                    
                    if (ball.yV>0)
                        distYbot*=50;
                    else
                        distYtop*=50;

                    if (ball.xV>0)
                        distXright*=50;
                    else
                        distXleft*=50;
                    
                    let max = Math.min(distYbot,distYtop,distXleft,distXright);

                    switch(max) {
                        case distYbot:
                            if (r+1>=grid.length || grid.at(r+1).at(c).power<=0) {
                                ball.y=posY;
                                if (ball.yV<0)
                                    ball.yV*=-1;
                                //ball.y=origY+unit*r+unit+ballR+cellBorderWidth*2;
                            }
                            break;
                        case distYtop:
                            if (r-1<0 || grid.at(r-1).at(c).power<=0) {
                                ball.y=posY;
                                if (ball.yV>0)
                                    ball.yV*=-1;
                                //ball.y=origY+unit*r-ballR-cellBorderWidth*2;
                            }
                            break;
                        case distXleft:
                            if (c-1<0 || grid.at(r).at(c-1).power<=0) {
                                ball.x=posX;
                                if (ball.xV>0)
                                    ball.xV*=-1;
                                //ball.x=origX+unit*c-ballR-cellBorderWidth*2;
                            }
                            break;
                        case distXright:
                            if (c+1>=grid.at(r).length || grid.at(r).at(c+1).power<=0) {
                                ball.x=posX;
                                if (ball.xV<0)
                                    ball.xV*=-1;
                                //ball.x=origX+unit*c+unit+ballR+cellBorderWidth*2;
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
    let d = Math.min(1/30, ticker.deltaTime/60);
    elapsed += d;
    // i*6+(1+i)*i/20
    let difficulty=round*6+(round+1)*round/20;

    if (md) aim();

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
            y0:ballY,
            x1:ballX,
            y1:ballY
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
        ball.x3=ball.x2;
        ball.y3=ball.y2;
        ball.x2=ball.x1;
        ball.y2=ball.y1;
        ball.x1=ball.x0;
        ball.y1=ball.y0;
        ball.x0=ball.x;
        ball.y0=ball.y;
        ball.x+=v.at(0)*d*ballSpd;
        ball.y+=v.at(1)*d*ballSpd;
        
        ballCheck(ball);
    }

    for(let r=0;r<grid.length;r++) {
        for(let c=0;c<grid.at(r).length;c++) {
            let cell=grid[r][c];
            if (cell.power<=0 && !cell.dead) {
                let flash=Math.min(1, cell.flash*1.5);
                let type=cell.type;
                cell.dead=true;
                special(cell);
                grid[cell.r][cell.c]=getEmptyCell(cell.r,cell.c);
                grid[cell.r][cell.c].flash=flash;
                grid[cell.r][cell.c].type=type;
            }
        }
    }

    if (rowsToAdd>0 && ballsOut.length<=0) {
        let lastRow = grid.at(-2);
        if (lastRow!=undefined) {
            for (let i=0;i<lastRow.length;i++) {
                if (lastRow.at(i).power>0) {
                    initAll();
                    return;
                }
            }
        }

        rowsToAdd--;
        round++;
        if ((round+10)%15==0) {
            gridW=Math.min(gridW+1, 16);
            gridH=Math.min(gridH+1, 18);
            fillGrid();
            fillCellTs();
        }

        addScore(Math.floor(Math.sqrt(round)));

        ballsIn+=1;

        do {
            for (let r=grid.length-1; r>0;r--) {
                grid[r]=grid[r-1];
                for (let c=0;c<grid.at(r).length;c++)
                    if (grid.at(r).at(c)!=undefined)
                        grid.at(r).at(c).r+=1;
            }
            let r = [];
            for(let c=0;c<grid.at(0).length;c++) {
                let cell = getEmptyCell(0,c);
                cell.c = c;
                cell.r = 0;
                cell.dead = false;
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
    drawBalls(d);
    drawCells(d);
    drawGui(d);
    
    if (ticks%60==0)
        console.log(window.performance.memory);
});

initAll();
