import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import * as MATHBOX from 'mathbox';

window.mathbox = mathBox({
    plugins: ['core', 'cursor', 'fullscreen', 'ui'],
    size: {
        maxRenderWidth: 1920,
        maxRenderHeight: 1080,
    },
    loop: {
        start: window == top.window,
    },
});

var three = mathbox.three;
three.renderer.setClearColor(0xffffff, 1.0);

if (window == top) {
    window.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
            case 38:
                present.set('index', present.get('index') - 1);
                break;
            case 39:
            case 40:
                present.set('index', present.get('index') + 1);
                break;
        }
    }
}

mathbox
    .set({
        scale: 720,
        focus: 3,
    })
    .group()
    .array({
        id: 'audioTime',
        data: [],
        width: 2048,
        channels: 1
    })
    .array({
        id: 'audioFreq',
        data: [],
        width: 1024,
        channels: 1,
    }).end();

var present =
    mathbox.present({
        index: 1
    });

var camera = mathbox.camera({
    lookAt: [0, 0, 0],
    position: [0, 0, 3]
});

var opening = present.slide();

var wave = opening.slide({ late: 1 })
    .reveal({
        duration: 1
    })
    .cartesian({
        range: [[-1 * Math.PI, Math.PI], [-1.2, 1.2], [-1, 1]],
        scale: [Math.PI, 1, 1],
        position: [0, 0, 0]
    })
    .step({
        script: [
            [{ position: [0, 0, 0] }],
            [{ position: [0, 3 / 4, 0] }]
        ],
        duration: 1,
    })
    .swizzle({
        source: '#audioTime',
        order: 'yx',
    })
    .transform({ scale: [3, 1, 1] })
    .spread({
        width: [1, 0, 0, 0],
    })
    .resample()
    .line({
        points: '<<',
        width: 2,
        color: 0x000000,
        opacity: 1,
        blending: 'normal',
    })
    .end().end().end();

var fft = opening.slide()
    .reveal({ duration: 1, delay: 1 / 2 })
    .cartesian({
        range: [[-256, 256], [-3, 0], [-1, 1]],
        scale: [3 / 2, 1, 1],
        position: [0, -3 / 4, 0]
    })
    .swizzle({
        source: '#audioFreq',
        order: 'yx',
    })
    .transform({ scale: [1, 1 / 100, 1] })
    .spread({
        width: [512, 0, 0, 0],
    })
    .resample()
    .line({
        points: '<<',
        width: 2,
        color: 0x000000,
        opacity: 1,
        blending: 'normal',
    })
    .end().end().end();

var sine = opening.slide({ steps: 1, late: 1 })
    .reveal({ duration: 1, delay: 1 / 2 })
    .cartesian({
        range: [[-1 * Math.PI, Math.PI], [-1.2, 1.2], [-1, 1]],
        position: [0, 0, 0], scale: [9 / (2 * Math.PI), 1, 1]
    })
    .step({
        script: [
            [{ position: [0, 0, 0], scale: [9 / (2 * Math.PI), 1, 1] }],
            [{ position: [6 / 5, 0, 0], scale: [9 / (2 * Math.PI), 1, 1] }],
        ],
        duration: 1
    })
    .axis({ zIndex: 0, })
    .axis({ axis: 2, zIndex: 0 })
    .interval({
        width: 200, channels: 2, expr: (emit, x, i, t) =>
            emit(x, Math.sin(x + 2 * t))
    })
    .line({ width: 2, color: 0x000000, zIndex: 2 })
    .end().end()

var circle = sine.slide({ late: 1 })
    .reveal({ duration: 1, delay: 0.5 })
    .cartesian({
        position: [-9 / 5, 0, 0],
        range: [[-1.2, 1.2], [-1.2, 1.2], [-1, 1]],
        scale: [1, 1, 1]
    })
    .axis()
    .axis({ axis: 2 })
    .interval({
        width: 400,
        expr: (emit, x, i, t) => {
            emit(x, Math.sqrt(1 - Math.pow(x, 2)));
            emit(x, -1 * Math.sqrt(1 - Math.pow(x, 2)))
        },
        channels: 2,
        items: 2
    })
    .join({ axis: 'items' })
    .face({ fill: false })
    .interval({
        width: 1,
        expr: function (emit, x, i, t) {
            emit(Math.cos(2 * t - Math.PI), Math.sin(2 * t - Math.PI));
            emit(Math.cos(2 * t - Math.PI), 0);
        },
        items: 2,
        channels: 2,
    })
    .vector({
        color: 0x33DD33,
        start: false,
        zIndex: 2
    })
    .interval({
        width: 1,
        expr: function (emit, x, i, t) {
            emit(Math.cos(2 * t - Math.PI), Math.sin(2 * t - Math.PI));
            emit(0, 0);
        },
        items: 2,
        channels: 2,
    })
    .vector({
        color: 0x000000,
        start: false,
        zIndex: 3
    })
    .end()
    .cartesian({
        range: [[-1 * Math.PI, Math.PI], [-1.2, 1.2], [-1, 1]],
        position: [6 / 5, 0, 0],
        scale: [9 / (2 * Math.PI), 1, 1]
    })
    .interval({
        width: 1,
        expr: function (emit, x, i, t) {
            emit(-1 * Math.PI, Math.sin(2 * t - Math.PI));
            emit(-1 * Math.PI, 0);
        },
        items: 2,
        channels: 2,
    })
    .vector({
        color: 0x33DD33,
        start: true,
        zIndex: 2
    })
    .end()
    .slide()
    .cartesian({
        position: [-9 / 5, 0, 0],
        range: [[-1.2, 1.2], [-1.2, 1.2], [-1, 1]],
        scale: [1, 1, 1]
    })
    .interval({
        width: 1,
        expr: function (emit, x, i, t) {
            emit(0, Math.sin(2 * t - Math.PI));
            emit(Math.cos(2 * t - Math.PI), Math.sin(2 * t - Math.PI));
        },
        items: 2,
        channels: 2,
    })
    .vector({
        color: 0xDD3333,
        start: false,
        zIndex: 2
    })
    .end()
    .cartesian({
        range: [[-1 * Math.PI, Math.PI], [-1.2, 1.2], [-1, 1]],
        position: [6 / 5, 0, 0],
        scale: [9 / (2 * Math.PI), 1, 1]
    })
    .interval({
        width: 1,
        expr: function (emit, x, i, t) {
            emit(-1 * Math.PI / 2, Math.cos(2 * t - Math.PI));
            emit(-1 * Math.PI / 2, 0);
        },
        items: 2,
        channels: 2,
    })
    .vector({
        color: 0xDD3333,
        start: true,
        zIndex: 2
    })
    .end()
    .end();


var audioHandler;
var audioContext;
var setup_audio = function () {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
        navigator.getUserMedia({ audio: true },
            function (stream) {
                start_microphone(stream);
            },
            function (e) {
                alert('Error capturing audio.');
            }
        );

    } else { alert('getUserMedia not supported in this browser.'); }

    function start_microphone(stream) {
        var microphone_stream = audioContext.createMediaStreamSource(stream);

        var analyser = audioContext.createAnalyser();
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        analyser.fftSize = 2048;

        var scratchTime = new Float32Array(analyser.fftSize);

        var bufferFreq = new Float32Array(analyser.frequencyBinCount);
        var bufferTime = new Float32Array(analyser.fftSize);
        three.on('update', audioHandler = function () {
            analyser.getFloatFrequencyData(bufferFreq);
            // Web Audio support is spotty
            if (analyser.getFloatTimeDomainData) {
                analyser.getFloatTimeDomainData(bufferTime);
            }
            else {
                analyser.getByteTimeDomainData(scratchTime);
                for (var i = 0; i < analyser.fftSize; ++i) {
                    bufferTime[i] = scratchTime[i];
                }
            }
        });

        mathbox.select('#audioFreq').set('data', bufferFreq);
        mathbox.select('#audioTime').set('data', bufferTime);

        microphone_stream.connect(analyser);
    }
}();

var resumeAudio = function () {
    console.log("starting audio context");
    audioContext.resume();
    document.removeEventListener("click", resumeAudio);
};
document.addEventListener("click", resumeAudio);
