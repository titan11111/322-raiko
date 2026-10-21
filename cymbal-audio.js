'use strict';
// Dedicated unpitched cymbals: no drum pitch sweep and no short noise loop.
window.createCymbalAudio=(context,destination)=>{
 const buffers=new Map(),voices=[];
 const bus=context.createGain(),compressor=context.createDynamicsCompressor();
 bus.gain.value=.8;compressor.threshold.value=-22;compressor.knee.value=12;compressor.ratio.value=4;compressor.attack.value=.003;compressor.release.value=.14;bus.connect(compressor);compressor.connect(destination);
 function bufferFor(kind){if(buffers.has(kind))return buffers.get(kind);const hat=kind==='hihat',length=hat?.24:1.65,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),data=buffer.getChannelData(0);let seed=hat?9817:22091,soft=0;
 const modes=hat?[2843,3911,5347]:[1223,1879,2731,3571,4637];
 for(let i=0;i<data.length;i++){const t=i/context.sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;soft=.72*soft+.28*white;const noise=.60*white+.40*soft;const attack=1-Math.exp(-t/(hat?.0015:.004)),envelope=Math.exp(-t/(hat?.035:.26));let metal=0;for(const f of modes)metal+=Math.sin(2*Math.PI*f*t)*Math.exp(-t/(hat?.022:.13));const end=Math.min(1,(length-t)/.025);data[i]=attack*end*((hat?.24:.19)*noise*envelope+.006*metal)}buffers.set(kind,buffer);return buffer}
 function fade(voice,t){if(voice.fading)return;voice.fading=true;voice.gain.gain.cancelScheduledValues(t);voice.gain.gain.setTargetAtTime(0,t,.006);voice.source.stop(t+.035)}
 function play(kind,side,power=1){const t=context.currentTime;const live=voices.filter(v=>!v.fading);if(kind==='hihat')for(const v of live)if(v.kind===kind)fade(v,t);const crashes=live.filter(v=>v.kind==='crash');if(kind==='crash'&&crashes.length>=3)fade(crashes[0],t);
 const source=context.createBufferSource(),high=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain(),pan=context.createStereoPanner?context.createStereoPanner():context.createGain();source.buffer=bufferFor(kind);source.loop=false;high.type='highpass';high.frequency.value=kind==='hihat'?1400:650;high.Q.value=.5;low.type='lowpass';low.frequency.value=kind==='hihat'?6500:5600;low.Q.value=.5;gain.gain.value=Math.min(1.35,Math.sqrt(power));if(pan.pan)pan.pan.value=side*.17;source.connect(high);high.connect(low);low.connect(gain);gain.connect(pan);pan.connect(bus);const voice={kind,source,gain,fading:false};voices.push(voice);source.onended=()=>{for(const node of [source,high,low,gain,pan])node.disconnect();const i=voices.indexOf(voice);if(i>=0)voices.splice(i,1)};source.start(t)}
 return{play,getState:()=>({active:voices.length,live:voices.filter(v=>!v.fading).length,cached:buffers.size})};
};
