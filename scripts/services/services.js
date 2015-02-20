var app = angular.module('fcc_gov_search.services', []);

app.factory('SearchFactory', function($http) {
    
    var factory = {};
    
    var solr_url;
    
    factory.init = function() {
      
        return $http.get('data/config.json', {
            }).then(function (response) {
                solr_url = response.data.solr_url;
        });
    };
    
    factory.get_tooltips = function () {
        
        return $http.get('data/tooltips.json').then(function (response) {
           return response.data;
        });
    };
    
    factory.get_filters = function (val) {
        
        return $http.get(val).then(function (response) {
           return response.data;
        });
    };
  
    factory.get_suggestions = function (val) {
        
        var url = solr_url + "fcc.oet.kdb/select?q=*:*&wt=json&indent=true&facet=true&facet.field=text&facet.mincount=1&facet.prefix=" + val;
        
        return $http.get(url).then(function (response) {
            var values = response.data.facet_counts.facet_fields.text;
            var total_values = values.length;
            
            var value_array = [];
            
            for ( var i = 0; i < total_values; i+=2)
            {
                value_array.push(values[i]);
            }
            
            return value_array;
        });
    };
    
    factory.check_spelling = function(term) {
      
        
      var spell_url1 = solr_url + "fcc.oet.kdb/spell?q=";
         var spell_url2 = "&spellcheck=true&spellcheck.collate=true&spellcheck.build=true&wt=json&indent=true";
         var spell_url = spell_url1 + term + spell_url2;
         var output = {};
    return $http.get(spell_url).then(function(result) {
      
      var suggestions = result.data.spellcheck.suggestions[1];
      output.numFound = suggestions.numFound;
      if (output.numFound > 0){
        output.word = suggestions.suggestion[0].word;
      }
      else{
          output.word = "";
      }
      return output;
    },    
    function(data) {
        output.error = "ERROR";
        return output;
    });
  };
  
  factory.changeTab = function(name, term, start){
      
        var edocs_web_facets = "&facet=true&facet.field=FCC_CallSigns&facet.field=topics&facet.field=FCC_Dollars&facet.field=FCC_Frequencies&facet.field=FCC_CaseCitations&facet.field=FCC_Rules&facet.field=FCC_Codes&facet.field=FCC_Records&facet.field=FCC_Forms";
        var all_facet_query="&facet=true&facet.field=source_type";
        var edocs_facet_query= edocs_web_facets+"&facet.field=bureaus&facet.field=dockets&facet.field=documentCategory&facet.field=docTypes&facet.field=fccNo&facet.field=daNo&facet.field=fccRecord&facet.field=fileNumber&facet.field=reportNumber&facet.field=federalRegisterCitation";
        var web_facet_query=edocs_web_facets+"&facet.field=authors&facet.field=taxonomies";
        
        var all_highlight_query = "&hl.fl=title,blurb&hl.simple.pre=<em>&hl.simple.post=</em>";
       
       var current_year = new Date().getFullYear();

        var edocs_last_modified_date_facet="";
        var edocs_adopted_date_facet="";
        var edocs_reply_comment_date_facet="";
        var web_date_facet="";
        var web_changed_facet="";

        for (var i = 0; i < 5; i++)
        {
            var year = current_year - i;
            var first_day = new Date(year, 0, 1);
            var last_day = new Date(year, 11, 31);

            var first_day_iso_date = first_day.toISOString();
            var last_day_iso_date = last_day.toISOString();

            edocs_last_modified_date_facet += "&facet.query=lastModifiedDate:[" + first_day_iso_date + " TO " + last_day_iso_date + "]";
            edocs_adopted_date_facet += "&facet.query=adoptedDate:[" + first_day_iso_date + " TO " + last_day_iso_date + "]";
            edocs_reply_comment_date_facet += "&facet.query=replyCommentDate:[" + first_day_iso_date + " TO " + last_day_iso_date + "]";
            web_date_facet += "&facet.query=date:[" + first_day_iso_date + " TO " + last_day_iso_date + "]";
            web_changed_facet += "&facet.query=changed:[" + first_day_iso_date + " TO " + last_day_iso_date + "]";


        ;}

        var edocs_date_facets = edocs_last_modified_date_facet + edocs_adopted_date_facet + edocs_reply_comment_date_facet;
        var web_date_facets = web_date_facet+  web_changed_facet;
        
        var sort_var = "changed";
          var output = {}; 
       
       if (name == "all"){
            sort_var = "date";
            
        }else if (name == "edocs"){
            sort_var = "releasedDate";
        } 
       
        var url = solr_url +name + '/select?wt=json&indent=true&sort=' + sort_var +'%20desc&q=';
        var query = url + '*%3A*';
        if (!term.length == 0){
             query = url +  term;
        }
     
        if (angular.isDefined( start ))
        {
            var start_query = "&start=" + start;
            query = query + start_query;          
        }
        
         switch(name){
            case "all": 
                query = query + all_facet_query + all_highlight_query;
                break;
            case "edocs": 
                query = query + edocs_facet_query + edocs_date_facets;
                break;
            case "web": 
                query = query + web_facet_query + web_date_facets;
                break;
        }
        
       
        
       return $http.get(query).then(function(result) {
        

      output = result.data;
 
      return output;
    },
    function(data) {
         output.error = "ERROR";
         return output;
    });   
     
    };
    
     factory.facet_query = function(name, term, fq, start){

       var output = {}; 
       
       var sort_var = "";
       
       if (name == "web"){
            sort_var = "changed";
            
        }else if (name == "edocs"){
            sort_var = "releasedDate";
        } 
       
        var url = solr_url +name + '/select?wt=json&indent=true&sort=' + sort_var +'%20desc&q=';
        var query = url + '*%3A*';
        if (!term.length == 0){
             query = url +  term;
        }
     
        if (angular.isDefined( start ))
        {
            var start_query = "&start=" + start;
            query = query + start_query;          
        }
        
         switch(name){
            case "edocs": 
                query = query + fq;
                break;
            case "web": 
                query = query + fq;
                break;
        }

       return $http.get(query).then(function(result) {
        

      output = result.data;
 
      return output;
    },
    function(data) {
         output.error = "ERROR";
         return output;
    });   
     
    };
   
    return factory;
  });

