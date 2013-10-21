var tsb = tsb || { viz : {} };

var regionNameMap = [
  ['North West England', 'North West'],
  ['North East England', 'North East'],
  ['South West England', 'South West'],
  ['South East England', 'South East']
];

tsb.viz.intro = {
  init: function(svg, w, h) {
    this.svg = svg;
    this.w = w;
    this.h = h;
    this.year = 2012;
    this.loadData()
  },
  loadData: function() {
    this.numProjects = 0;
    var svg = this.svg;
    var w = this.w;
    var h = this.h;
    tsb.state.dataSource.getProjectsByYear(this.year).then(function(projects) {
      this.createProjects(projects.rows);
      this.addLabels();
    }.bind(this));
  },
  createProjects: function(rows) {
    var spacingX = 8;
    var spacingY = 25;
    var margin = 40;
    rows.forEach(function(project, projectIndex) {
      var projectsPerLine = Math.floor((this.w - 2*margin) / spacingX);
      var px = margin + (projectIndex % projectsPerLine) * spacingX;
      var py = margin + Math.floor(projectIndex / projectsPerLine) * spacingY;
      var pw = 5;
      var ph = 15;
      var budgetAreaCode = tsb.common.extractBudgetAreaCode(project.budgetArea);
      var color = tsb.config.themes.current.budgetAreaColor[budgetAreaCode];
      this.makeRect(px, py, pw, ph, color, 'project');
    }.bind(this));
  },
  makeRect: function(x, y, w, h, color, className) {
    this.svg
      .append('g')
      .append('rect')
      .attr('class', className)
      .attr('x', x).attr('y', y+h)
      .attr('width', w).attr('height', 0)
      .attr('fill', color)
      .style('opacity', 0.5)
      .transition().delay(Math.random()*120000)
      .attr('y', y)
      .attr('height', h)
      .each('end', this.onProjectAnimComplete.bind(this))
  },
  onProjectAnimComplete: function() {
    this.projectCount.text(++this.numProjects + ' projects');
  },
  addLabels: function() {
    var labelGroup = this.labelGroup = this.svg.append('g');
    labelGroup.append('text')
      .text('In 2012 we funded')
      .attr('dx', 100)
      .attr('dy', 200)
      .attr('fill', '#FFF')
      .style('font-size', '6em')
      .style('font-weight', '100');

    this.projectCount = labelGroup.append('text')
      .text('0 projects')
      .attr('dx', 100)
      .attr('dy', 320)
      .attr('fill', '#FFF')
      .style('font-size', '6em')
      .style('font-weight', '100');

    labelGroup
      .style('opacity', 0)
      .transition().duration(2000)
      .style('opacity', 1);
  }
}
