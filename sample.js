import * as pie from './pie.js';

document.addEventListener("DOMContentLoaded", function(event) {
  const canvas = document.getElementById('canvas');

  // first pie start degree
  const pieColors = ['#0074D9', '#39CCCC', '#2ECC40', '#FFDC00', '#FF851B', '#F012BE', '#FF4136', '#001f3f'];
  const pieLabels = ['Physical', 'Financial', 'Social', 'Emotional', 'Relationship', 'Life Style', 'Career', 'Life Dreams'];
  const circleNum = 4;

  const cfg = {
    xOrigin: 350.0, // x origin
    yOrigin: 350.0, // y origin
    radius: 315.0, // radius
    pieColors: pieColors,
    pieLabels: pieLabels,
    circleNum: 4,
    clickHandler: setScore
  };

  pie.Init(canvas, cfg);
  // render pie
  pie.Render();

  // render legend 
  const pieLabelsFull = ['Physical Wellbeing', 'Financial Wellbeing', 'Social Wellbeing', 'Emotional Wellbeing', 'Relationship(Significant)', 'Life Style', 'Career/Bussiness', 'Life Dreams'];
  pieLabelsFull.forEach((label,i) => {
    let legend = `
        <div class="factor">
          <div class="box" style="background-color:` +
      pieColors[i] + `"></div>
          <div class="factor_lbl">` + 
      label + `</div>
          <div class="factor_val" id="fct` + 
      i + `">0</div>
        </div> `;
    $('#legend').append(legend); 
  });
});

function setScore(pieId, circleId) {
  const PIE_NUM = 8;
  const scores = [
    [2.5, 5, 7.5, 10],// pie 0
    [2.5, 5, 7.5, 10],// pie 1
    [2.5, 5, 7.5, 10],// pie 2
    [2.5, 5, 7.5, 10],// pie 3
    [2.5, 5, 7.5, 10],// pie 4
    [2.5, 5, 7.5, 10],// pie 5
    [2.5, 5, 7.5, 10],// pie 6
    [2.5, 5, 7.5, 10] // pie 7
  ];
  let val = scores[pieId][circleId];
  $('#fct' + pieId).text(val);
  let ttl = 0;
  for(let i = 0; i < PIE_NUM; i++) {
    let em = $('#fct' + i);
    ttl += parseInt(em.text());
  }
  $('#ttlScore').text(ttl);
}
