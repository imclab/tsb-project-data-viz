function SPARQLDataSource(endpoint) {
  SPARQLDataSource.endpoint = endpoint || SPARQLDataSource.endpoint;
}

SPARQLDataSource.endpoint = "proxy.php";

SPARQLDataSource.prototype.query = function(queryStr) {
  var deferred = Q.defer();
  var self = this;

  var sparqler = new SPARQL.Service('http://tsb-projects.labs.theodi.org/sparql.json?format=json');
  sparqler.setPrefix("tsb", "http://tsb-projects.labs.theodi.org/def/");
  sparqler.setPrefix("rdf", "http://www.w3.org/2000/01/rdf-schema#");
  sparqler.setPrefix("w3", "http://www.w3.org/ns/org#");
  sparqler.setMethod("GET");
  sparqler.setOutput("json");
  var query = sparqler.createQuery();
  query.query(queryStr, {
    failure: function(err) { deferred.reject(new Error(err)); },
    success: function(json) {
      if (!json) {
        deferred.reject(new Error('No data'));
        return;
      }
      var data = json.results.bindings.map(self.extractValues);
      var dataSet = DataSet.fromArray(data);
      deferred.resolve(dataSet);
    }
  });

  return deferred.promise;
}

SPARQLDataSource.prototype.extractValues = function(binding) {
  var o = {};
  for(var propertyName in binding) {
    o[propertyName] = binding[propertyName].value;
  }
  return o;
}

SPARQLDataSource.prototype.getProjects = function() {
  var q =" \
    SELECT (?p as ?uri) ?label \
    WHERE { \
      ?p a tsb:Project . \
      ?p rdf:label ?label \
    }";

  return this.query(q);
}

SPARQLDataSource.prototype.getProjectsParticipants = function() {
  var q =" \
    SELECT ?project ?projectLabel ?participant ?participantLabel \
    WHERE { \
      ?project a tsb:Project . \
      ?project rdf:label ?projectLabel . \
      ?project tsb:hasParticipant ?participant . \
      ?participant rdf:label ?participantLabel . \
    }";

  return this.query(q);
}

SPARQLDataSource.prototype.getProjectParticipants = function(projectId) {
  var q =" \
    SELECT ?participant ?participantLabel ?participantRegion ?participantEntityForm \
    WHERE { \
      <" + projectId + "> tsb:hasParticipant ?participant . \
      ?participant rdf:label ?participantLabel . \
      ?participant tsb:legalEntityForm ?participantEntityForm . \
      ?participant w3:hasSite ?participantSite . \
      ?participantSite tsb:region ?participantRegion . \
    }";

  return this.query(q);
}

SPARQLDataSource.prototype.getProjectInfo = function(projectId) {
  var q =" \
    SELECT ?projectLabel \
    WHERE { \
      <" + projectId + "> rdf:label ?projectLabel . \
    }";

  return this.query(q);
}

/*
select (count(distinct(?o)) as ?numParticipants) ?project ?projectLabel where {
  ?o a <http://tsb-projects.labs.theodi.org/def/Organization> .
  ?o <http://tsb-projects.labs.theodi.org/def/participatesIn> ?project .
    {
      select ?project ?projectLabel  where {
        ?project a <http://tsb-projects.labs.theodi.org/def/Project> .
        ?project <http://www.w3.org/2000/01/rdf-schema#label> ?projectLabel .
        ?project <http://tsb-projects.labs.theodi.org/def/hasParticipant>  <http://tsb-projects.labs.theodi.org/id/organization/04190816> .
      } 
    }
}  GROUP BY ?project ?projectLabel
(/)
*/


SPARQLDataSource.prototype.getOrganisationProjects = function(organisationId) {
  var q =" \
    SELECT (count(distinct(?o)) as ?numParticipants) ?project ?projectLabel \
    WHERE { \
      ?o a tsb:Organization . \
      ?o tsb:participatesIn ?project . \
      { \
        SELECT ?project ?projectLabel \
        WHERE { \
          ?project a tsb:Project . \
          ?project rdf:label ?projectLabel . \
          ?project tsb:hasParticipant  <" + organisationId + "> . \
        } \
      } \
    } \
    GROUP BY ?project ?projectLabel \
    ";

  return this.query(q);
}