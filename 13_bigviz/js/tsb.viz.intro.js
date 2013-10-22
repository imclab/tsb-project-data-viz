var tsb = tsb || { viz : {} };

tsb.viz.intro = {
  init: function(svg, w, h) {
    this.svg = svg;
    this.w = w;
    this.h = h;
    this.year = (new Date().getFullYear());
    this.duration = 60000;
    this.loadData();

    svg
    .append('rect')
    .attr('class', 'bg')
    .attr('width', tsb.state.w).attr('height', tsb.state.h)
    .attr('fill', tsb.config.themes.current.introBgColor)
  },
  loadData: function() {
    this.numProjects = 0;
    var svg = this.svg;
    var w = this.w;
    var h = this.h;
    tsb.state.dataSource.getProjectsForYear(this.year).then(function(projects) {
      this.createProjects(projects.rows);
      this.addLabels();
      this.addKeyFacts();
    }.bind(this));
  },
  createProjects: function(rows) {
    var pw = 8;
    var ph = 20;
    var spacingX = pw + 5;
    var spacingY = ph + 10;
    var margin = 40;
    console.log('tsb.viz.intro.createProjects', rows.length);
    rows.forEach(function(project, projectIndex) {
      var projectsPerLine = Math.floor((this.w - 2*margin) / spacingX);
      var px = margin + (projectIndex % projectsPerLine) * spacingX;
      var py = margin + Math.floor(projectIndex / projectsPerLine) * spacingY;
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
      .style('opacity', tsb.config.themes.current.budgetAreaColorAlpha)
      .transition().delay(Math.random()*this.duration)
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
      .text('In ' + this.year + ' we funded')
      .attr('dx', 100)
      .attr('dy', 200)
      .attr('fill', tsb.config.themes.current.introTextColor)
      .style('font-size', '6em')
      .style('font-weight', tsb.config.themes.current.introTextFontWegith);

    this.projectCount = labelGroup.append('text')
      .text('0 projects')
      .attr('dx', 100)
      .attr('dy', 320)
      .attr('fill', tsb.config.themes.current.introTextColor)
      .style('font-size', '6em')
      .style('font-weight', tsb.config.themes.current.introTextFontWegith);

    labelGroup
      .style('opacity', 0)
      .transition().duration(2000)
      .style('opacity', 1);
  },
  addKeyFacts: function() {
    var images = ['assets/priorityAreas.png', 'assets/regions.png', 'assets/collaborations.png'];
    var imageSize = 120;
    var margin = 50;
    var spacing = (this.h - 2 * margin - images.length * imageSize) / (images.length - 1);
    images.forEach(function(image, imageIndex) {
      this.svg.append('image')
      .attr('x', this.w - margin - imageSize)
      .attr('y', margin + (spacing + imageSize) * imageIndex)
      .attr('width', imageSize)
      .attr('height', imageSize)
      .attr('xlink:href', image)
    }.bind(this))
    //<image x="20" y="20" width="300" height="80"
    // xlink:href="http://jenkov.com/images/layout/top-bar-logo.png" />
  }
}
