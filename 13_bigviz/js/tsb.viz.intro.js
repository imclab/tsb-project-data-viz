var tsb = tsb || { viz : {} };

tsb.viz.intro = {
  init: function(svg, w, h, staticMode) {
    this.svg = svg;
    this.w = w;
    this.h = h;
    this.staticMode = staticMode;
    this.year = (new Date().getFullYear());
    this.duration = 60000;
    this.loadData();
    this.minimizeDelay = 3000;
    this.minimizeTime = 2000;
    this.titleScale = 1;
    this.titleX = 0;
    this.titleY = 0;
    this.eatenLetters = -1;

    this.numClipPaths = 3;
    this.subVizBtnSize = 270;
    this.subVizBtnMargin = 160;

    this.bg = svg
    .append('rect')
    .attr('class', 'bg')
    .attr('width', this.w).attr('height', this.h)
    .attr('fill', tsb.config.themes.current.introBgColor);
  },
  close: function() {
    if (this.updateLabelsAnim) {
      clearInterval(this.updateLabelsAnim);
     this.updateLabelsAnim = null;
    }
  },
  loadData: function() {
    this.numProjects = 0;
    this.displayedNumProjects = 0;
    var svg = this.svg;
    var w = this.w;
    var h = this.h;
    tsb.state.dataSource.getProjectsForYear(this.year).then(function(projects) {
      this.createProjects(projects.rows);
      var alreadyOpened = document.location.hash == '#introopened';
      this.addLabels(alreadyOpened);
      if (!this.staticMode) {
        this.addVizButtons();
        if (document.location.hash != '#introopened') {
          this.showVizButtons();
        }
      }
      if (alreadyOpened) {
        this.minimizeTime = 0;
        this.minimizeDelay = 0;
        this.eatenLetters = 50;
        this.showVizButtons();
      }
    }.bind(this));
  },
  createProjects: function(projects) {
    var pw = 8;
    var ph = 20;
    var spacingX = 4;
    var spacingY = 8;
    var marginY = 8;

    var maxWidth = tsb.common.getMaxWidth(this.w);
    var leftMargin = this.leftMargin = (this.w - maxWidth)/2;
    var containerMargin = tsb.config.themes.current.containerMargin;

    maxWidth = this.w;
    leftMargin = 0;
    containerMargin = 0;
    marginY = 0;

    var projectsPerRow = Math.floor((maxWidth + spacingX - containerMargin*2) / (pw + spacingX));

    var numFullRows = Math.floor(projects.length / projectsPerRow);

    ph = Math.floor((this.h - marginY*2 + spacingY - numFullRows * spacingY)/numFullRows);

    projects.forEach(function(project, projectIndex) {
      var row = Math.floor(projectIndex / projectsPerRow);
      var px = leftMargin + containerMargin + (projectIndex % projectsPerRow) * (pw + spacingX);
      var py = marginY + row * (ph + spacingY);
      var budgetAreaCode = tsb.common.extractBudgetAreaCode(project.budgetArea);
      var color = tsb.config.themes.current.budgetAreaColor[budgetAreaCode];
      if (row >= numFullRows) ph = 0;
      this.makeRect(px, py, pw, ph, color, 'project', projectIndex);
    }.bind(this));
  },
  makeRect: function(x, y, w, h, color, className, projectIndex) {
    var projectRect = this.svg
      .append('g')
      .append('rect')
      .attr('class', className)
      .attr('x', x).attr('y', y+h)
      .attr('width', w).attr('height', this.staticMode ? h : 0)
      .attr('fill', color)
      .style('opacity', tsb.config.themes.current.budgetAreaColorAlpha);

    if (this.staticMode) {
      this.numProjects++;
    }
    else {
      projectRect
        .transition().delay(Math.random()*this.duration)
        .attr('y', y)
        .attr('height', h)
        .each('end', this.onProjectAnimComplete.bind(this));
    }
  },
  onProjectAnimComplete: function() {
    if (!this.staticMode) {
      this.numProjects++;
      //this.updateLabels();
    }
  },
  addLabels: function(alreadyOpened) {
    var labelGroup = this.labelGroup = this.svg.append('g');

    this.title = labelGroup.append('text')
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('fill', tsb.config.themes.current.introTextColor)
      .style('font-size', tsb.config.themes.current.titleFontSize * 2)
      .style('font-weight', tsb.config.themes.current.introTextFontWeight);

    this.projectCount = labelGroup.append('text')
      .attr('dx', 0)
      .attr('dy', tsb.config.themes.current.titleFontSize*2.5)
      .attr('fill', tsb.config.themes.current.introTextColor)
      .style('font-size', tsb.config.themes.current.titleFontSize * 2)
      .style('font-weight', tsb.config.themes.current.introTextFontWeight);

    labelGroup
      .style('opacity', (this.staticMode || alreadyOpened) ? 1 : 0)

    if (!this.staticMode) {
      labelGroup
        .transition().duration(2000)
        .style('opacity', 1);
    }

    if (this.updateLabelsAnim) {
      clearInterval(this.updateLabelsAnim);
    }
    this.updateLabelsAnim = setInterval(this.updateLabels.bind(this), 1/30);

    this.updateLabels();
    this.resize(this.w, this.h); //force layout update
  },
  updateLabels: function() {
    var titleText = tsb.config.text.introTitle.replace('YEAR', this.year);
    var projectCountText = tsb.config.text.introTitle2.replace('NUMPROJECTS', this.numProjects);

    if (this.eatenLetters >= 0) {
      this.eatenLetters += 0.5;
      var cut = Math.floor(this.eatenLetters);
      titleText += projectCountText.substr(0, cut);
      projectCountText = projectCountText.substr(cut);
    }

    this.title.text(titleText);
    this.projectCount.text(projectCountText);
  },
  resize: function(w, h) {
    this.w = w;
    this.h = h;

    var maxWidth = this.maxWidth = tsb.common.getMaxWidth(this.w);
    var leftMargin = this.leftMargin = (this.w - maxWidth)/2;
    var containerMargin = tsb.config.themes.current.containerMargin;
    var titleFontSize = tsb.config.themes.current.titleFontSize;

    if (this.titleScale == 1) {
      this.titleX = leftMargin + containerMargin;
      this.titleY = this.h/2 - tsb.config.themes.current.titleFontSize * 1.5;
    }
    else {
      this.titleX = leftMargin + containerMargin;
      this.titleY = titleFontSize + containerMargin;
    }

    this.bg
      .attr('width', this.w);

    this.labelGroup
      .attr('transform', 'translate('+(this.titleX)+','+(this.titleY)+') scale('+this.titleScale+','+this.titleScale+')');

    var margin = this.subVizBtnMargin;
    var spacing = (maxWidth - this.subVizBtnSize * this.numClipPaths) / (this.numClipPaths + 1);
    var marginTop = this.h/2 + this.subVizBtnSize/10;

    if (this.subVizButtons) {
      this.subVizButtons
        .attr('transform', function(d) {
          var x = leftMargin + d * spacing + d * this.subVizBtnSize + this.subVizBtnSize/2 + spacing;
          return 'translate('+x+','+marginTop+')';
        }.bind(this))
    }
  },
  addVizButtons: function() {
    this.makeClipPaths();
    this.resize(this.w, this.h);
  },
  makeClipPaths: function() {
    var maxWidth = this.maxWidth = tsb.common.getMaxWidth(this.w);
    var leftMargin = this.leftMargin = (this.w - maxWidth)/2;
    var containerMargin = tsb.config.themes.current.containerMargin;
    var titleFontSize = tsb.config.themes.current.titleFontSize;

    var subVizButtons = this.subVizButtons = this.svg.selectAll('circle')
      .data(d3.range(this.numClipPaths))
      .enter()
      .append('g')

    subVizButtons
      .append('clipPath')
        .attr('id', function(d) { return 'clipPath_' + d; })
      .append('circle')
        .attr('class', 'cookieCutter')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 0)
        .attr('fill', 'rgba(255,255,0,1)');

    subVizButtons
       .attr('clip-path', function(d) { return 'url(#clipPath_'+d+')'});

    subVizButtons
      .append('rect')
        .attr('x', -this.subVizBtnSize*0.6)
        .attr('y', -this.subVizBtnSize*0.6)
        .attr('width', this.subVizBtnSize*1.2)
        .attr('height', this.subVizBtnSize*1.2)
        .attr('fill', function(d) { return tsb.config.themes.current.introVizBtnBgColor; });

    subVizButtons
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', tsb.config.themes.current.introVizBtnFontSize/2)
      .style('font-size', tsb.config.themes.current.introVizBtnFontSize)
      .attr('fill', function(d) { return tsb.config.themes.current.introVizBtnLabelColors[d]; })
      .text(function(d) { return tsb.config.introVizBtnLabels[d]; });

    subVizButtons.on('click', function(d) {
      document.location.href = tsb.config.introVizBtnLinks[d];
    })
  },
  showVizButtons: function() {
    var maxWidth = this.maxWidth = tsb.common.getMaxWidth(this.w);
    var leftMargin = this.leftMargin = (this.w - maxWidth)/2;
    var containerMargin = tsb.config.themes.current.containerMargin;
    var titleFontSize = tsb.config.themes.current.titleFontSize;

    this.labelGroup
      .transition()
      .delay(this.minimizeDelay)
      .duration(this.minimizeTime)
      .attr('transform', 'translate('+(leftMargin + containerMargin)+','+(titleFontSize + containerMargin)+') scale(0.5, 0.5)')
      .each('start', function() {
        if (this.eatenLetters == -1) {
          this.eatenLetters = 0; //start eating
        }
      }.bind(this))
      .each('end', function() {
        this.titleX = leftMargin + containerMargin;
        this.titleY = titleFontSize + containerMargin;
        this.titleScale = 0.5;
      }.bind(this));

    this.subVizButtons.selectAll('.cookieCutter')
      .transition()
      .delay(function(d) { return this.minimizeDelay + this.minimizeTime*0.5 + d * this.minimizeTime*0.1}.bind(this))
      .duration(this.minimizeTime)
      .attr('r', this.subVizBtnSize/2)

    //TODO: show buttons here
  }
}
