var app = angular.module('fcc_gov_search', ['fcc_gov_search.directives', 'fcc_gov_search.services', 'ui.bootstrap', 'angularSpinner']);

app.controller('fcc_gov_search_controller', ["$scope","SearchFactory", "$modal", "usSpinnerService", function ($scope, SearchFactory, $modal, usSpinnerService){
      
    $scope.search_facets =  !$scope.search_facets;
    $scope.search_wrong_spell = !$scope.search_wrong_spell;
    $scope.search_spell = !$scope.search_spell;
    $scope.search_pagination = !$scope.search_pagination;
    $scope.theValue =  'Add more values';
    var current_selection = "all";
    
    $scope.maxSize = 5;
    $scope.bigCurrentPage = 1;
    $scope.selected = undefined;
    
     $("#tab_all").addClass('pressed');
    
    $scope.startSpin = function(){
        usSpinnerService.spin('spinner-1');
    }
    $scope.stopSpin = function(){
        usSpinnerService.stop('spinner-1');
    }
    
    if (SearchFactory.solr_url)
    {
     }
     {
           SearchFactory.init();
     }
     
        
         $scope.get_suggestions = function (val) {
        return SearchFactory.get_suggestions(val);
    };
    
    var facet_filters;
    
    $scope.searchBtn = function(name){
        
         $scope.items = "" ;
        $scope.source_type =  !$scope.source_type;
        $scope.date_facet =  !$scope.date_facet;
        if (angular.isDefined( name ))
        {
            current_selection = name;
        }
        
        switch (current_selection)
        {
            case "all":
                break;
            case "edocs":
                SearchFactory.get_filters('data/edocs_facets.json').then(function(data)
                {
                   facet_filters = angular.copy(data);
                });
                break;
            case "web":
                SearchFactory.get_filters('data/web_facets.json').then(function(data)
                {
                   facet_filters = angular.copy(data);
                });
                break;
        }
        
        $scope.check_spelling();
     };
     
     
     $scope.check_spelling = function ()
     {
        
         var term = $scope.asyncSelected;
         
         if (term)
         {
             SearchFactory.check_spelling(term).then(function(data)
             {
                 if (data.error)
                 {
                    $scope.modal_open("sm");
                }
                else
                {
                    if (data.numFound > 0)
                    {
                        $scope.search_spell = false;
                        $scope.word = data.word;
                        get_search_results(current_selection, data.word);
                    }
                    else
                    {
                          $scope.search_spell = true;
                        get_search_results(current_selection, term);
                    }
                }
             });
        }
        else
        {
                $scope.search_spell = true;
                get_search_results(current_selection, "");
        }
        
        $scope.bigCurrentPage = 1;
          
     };
     
     
    $scope.get_results = function (){
        $scope.search_spell = true;
        $scope.search_wrong_spell = true;
        var term = $scope.word;
        get_search_results(current_selection, term);
    };
    
    $scope.get_wrong_results = function (){
        $scope.search_spell = true;
        $scope.search_wrong_spell = false;
        var term = $scope.asyncSelected;
        get_search_results(current_selection, term);
    };
    
    $scope.pageChanged = function() {
         var term = $scope.asyncSelected;
         
         if ($scope.bigCurrentPage > 1)
        {
            var n = ($scope.bigCurrentPage - 1)*10 +1;
            if (term)
            {
                get_search_results(current_selection, term, n); 
            }
            else
            {
                get_search_results(current_selection, "", n);
            }
        }
        else
        {
             if (term)
            {
                get_search_results(current_selection, term); 
            }
            else
            {
                get_search_results(current_selection, "");
            }
        }
    };
    
     $scope.toggleSelection = function(a, b, c, obj_name){
         
        _.find($scope.data[a].children[b].children, function(obj){ 
            if (obj.name == obj_name)
            {
                obj.selected = !obj.selected;
            }
        });

        var term = $scope.asyncSelected;
        
        var facet_filter_string = "";

        _.map($scope.data, 
            function(item)
            { 
                var c = item.children;

                _.each(c,

                function(ch)
                { 

                    var d = ch.children;

                    _.find(d, function(num){ 
                        if (num.selected == true)
                        {
                            var str = "";
                            switch(ch.facet)
                            {
                                case "adoptedDate":
                                    str = get_year_end_date_query(num.value, ch.facet);
                                    break;
                                 case "lastModifiedDate":
                                    str = get_year_end_date_query(num.value, ch.facet);
                                    break;
                                  case "date":
                                    str = get_year_end_date_query(num.value, ch.facet);
                                    break;
                                case "replyCommentDate":
                                    str = get_year_end_date_query(num.value, ch.facet);
                                    break;
                                case "changed":
                                    str = get_year_end_date_query(num.value, ch.facet);
                                    break;
                                default:
                                     str = '&fq=' + ch.facet + ':"' + num.value.replace('&', '%26') + '"';
                                     break;
                            }
                            facet_filter_string += str;
                        }
                    });

                }
                );
            }
         );

         if (term)
         {
             get_faceted_search_results(current_selection, term, facet_filter_string);
         }
        else
        {
                get_faceted_search_results(current_selection, "", facet_filter_string);
        }
        
        $scope.bigCurrentPage = 1;
        
    };
    
    function get_year_end_date_query(year, facet)
    {
        var first_day = new Date(year, 0, 1);
        var last_day = new Date(year, 11, 31);

        var first_day_iso_date = first_day.toISOString();
        var last_day_iso_date = last_day.toISOString();
        
        var date_facet = "&fq=" + facet + ":[" + first_day_iso_date + " TO " + last_day_iso_date + "]";
        
        return date_facet;
    }
    
    var search_tooltips;
    
    SearchFactory.get_tooltips().then(function(data)
    {
        $scope.search_button_tooltip= data.search_button_hi;
        $scope.tab_all_tooltip= data.tab_all;
        $scope.tab_edocs_tooltip= data.tab_edocs;
        $scope.tab_web_tooltip= data.tab_web;
        $scope.filters_header_tooltip= data.filters_header;
        
        search_tooltips = angular.copy(data);
        
    });
    
    $scope.show_tooltip = function(p,c){
        
        var nm = $scope.data[p].children[c].facet;
        var tnm = "facethelp_" + nm;
       
        $scope.dynamic_tooltip = search_tooltips[tnm];
};

 $scope.show_tooltip_inputbox = function(p,c){
        
        var nm = $scope.data[p].children[c].facet;
       
         switch(nm)
        {
            case "adoptedDate":
                $scope.inputbox_tooltip = search_tooltips.facetval_daterange;
                break;
             case "lastModifiedDate":
                $scope.inputbox_tooltip = search_tooltips.facetval_daterange;
                break;
              case "date":
                $scope.inputbox_tooltip = search_tooltips.facetval_daterange;
                break;
            case "replyCommentDate":
                $scope.inputbox_tooltip = search_tooltips.facetval_daterange;
                break;
            case "changed":
                $scope.inputbox_tooltip = search_tooltips.facetval_daterange;
                break;
            case "FCC_Dollars":
                $scope.inputbox_tooltip = search_tooltips.facetval_FCC_Dollars;
                break;
            case "FCC_Frequencies":
                $scope.inputbox_tooltip = search_tooltips.facetval_FCC_Frequencies;
                break;
            default:
                 $scope.inputbox_tooltip = search_tooltips.facetval_string1;
                 break;
        }
       
       
};
    
    $scope.hide_inputbox= function(p, c){
          
           var nm = $scope.data[p].children[c].facet;
          
          switch(nm)
          {
              case "bureaus":
                  return true;
                  break;
              case "documentCategory":
                  return true;
                  break;
              case "docTypes":
                  return true;
                  break;
              case "adoptedDate":
                 return true;
                break;
             case "lastModifiedDate":
                 return true;
                break;
              case "date":
                 return true;
                break;
            case "replyCommentDate":
                 return true;
                break;
            case "changed":
                 return true;
                break;  
          }

           return false;
       };
       
        $scope.hide_datebox= function(p, c){
          
           var nm = $scope.data[p].children[c].facet;
          
          switch(nm)
          {
              case "adoptedDate":
                 return false;
                break;
             case "lastModifiedDate":
                 return false;
                break;
              case "date":
                 return false;
                break;
            case "replyCommentDate":
                 return false;
                break;
            case "changed":
                 return false;
                break;  
          }

           return true;
       };
       
    $scope.hide_parent= function(p, c){
          
           var l = $scope.data[p].children[c].children.length;
           for ( var i = 0; i < l ; i++)
           {
               if ($scope.data[p].children[c].children[i].selected)
               {
                   return true;
               }
           }

           return false;
       };
       
    function get_faceted_search_results(type, term, fq, start)
    {
         $scope.startSpin();
         
         SearchFactory.facet_query(type, term, fq, start).then(function(data)
        {
            $scope.stopSpin();
             if (data.error)
             {
                 $scope.modal_open("sm");
             }
             else
             {
                $scope.searches = data.response.docs;
                $scope.bigTotalItems = data.response.numFound;
                search_pagination(type, term);
            }
        });
    }
    
    function search_pagination(type, term){
       
          if($scope.bigTotalItems < 11){
              $scope.search_pagination = true;
         }else{
            $scope.search_pagination = false;
         }
        
    }
    
      function get_search_results(type, term, start)
    {
         $scope.startSpin();
         
         SearchFactory.changeTab(type, term, start).then(function(data)
        {
            $scope.stopSpin();
            
         //   console.log(JSON.stringify(data));
             if (data.error)
             {
                 $scope.modal_open("sm");
             }
             else
             {
                $scope.searches = data.response.docs;
                $scope.bigTotalItems = data.response.numFound;
                search_pagination(type, term);
                
                switch(current_selection){
                       case "all":  $("#tab_all").addClass('pressed');
                                    $("#tab_web").removeClass('pressed');
                                    $("#tab_edocs").removeClass('pressed');
                                    $scope.search_facets = true;
                                    $scope.search_docs = true;

                            var   all_data = [{
                                   name: 'Categories',
                                   children: [
                                       {
                                       name: 'Source Type',
                                       children: [
                                           { name: 'FCC.gov content (' + data.facet_counts.facet_fields.source_type[3] + ')'}, 
                                           {name: 'Commission Documents (' + data.facet_counts.facet_fields.source_type[1] + ')'}]}

                                   ]}
                           ]; 

                         $scope.data = all_data;                      
                           break;
                       case "edocs": 
                                    $("#tab_edocs").addClass('pressed');
                                    $("#tab_web").removeClass('pressed');
                                    $("#tab_all").removeClass('pressed');
                                    $scope.search_facets = false;
                                    $scope.search_docs = false;
                                    
                                    var total_edocs_call_signs = data.facet_counts.facet_fields.FCC_CallSigns.length;
                                    var edocs_call_signs_array = [];
                                    
                                    for (var i = 0; i < total_edocs_call_signs; i +=2)
                                    {
                                        edocs_call_signs_array.push({ name: data.facet_counts.facet_fields.FCC_CallSigns[i], count: data.facet_counts.facet_fields.FCC_CallSigns[i+1], value: data.facet_counts.facet_fields.FCC_CallSigns[i], selected:false});
                                    }
                                    
                                    var total_edocs_bureaus = data.facet_counts.facet_fields.bureaus.length;
                                    var edocs_bureaus_array = [];
                                    
                                    for (var i = 0; i < total_edocs_bureaus; i +=2)
                                    {
                                        edocs_bureaus_array.push({ name: data.facet_counts.facet_fields.bureaus[i], count: data.facet_counts.facet_fields.bureaus[i+1], value: data.facet_counts.facet_fields.bureaus[i], selected:false});
                                    }
                                    
                                    var total_edocs_dockets = data.facet_counts.facet_fields.dockets.length;
                                    var edocs_dockets_array = [];
                                    
                                    for (var i = 0; i < total_edocs_dockets; i +=2)
                                    {
                                        edocs_dockets_array.push({ name: data.facet_counts.facet_fields.dockets[i], count: data.facet_counts.facet_fields.dockets[i+1], value: data.facet_counts.facet_fields.dockets[i], selected:false});
                                    }
                                   
                                    var total_edocs_documentCategory = data.facet_counts.facet_fields.documentCategory.length;
                                    var edocs_documentCategory_array = [];
                                    
                                    for (var i = 0; i < total_edocs_documentCategory; i +=2)
                                    {
                                        edocs_documentCategory_array.push({ name: data.facet_counts.facet_fields.documentCategory[i], count: data.facet_counts.facet_fields.documentCategory[i+1], value: data.facet_counts.facet_fields.documentCategory[i], selected:false});
                                    }
                                    
                                    var total_edocs_docTypes = data.facet_counts.facet_fields.docTypes.length;
                                    var edocs_docTypes_array = [];
                                    
                                    for (var i = 0; i < total_edocs_docTypes; i +=2)
                                    {
                                        edocs_docTypes_array.push({ name: data.facet_counts.facet_fields.docTypes[i], count: data.facet_counts.facet_fields.docTypes[i+1], value: data.facet_counts.facet_fields.docTypes[i], selected:false});
                                    }
                                    
                                    var total_edocs_federalRegisterCitation = data.facet_counts.facet_fields.federalRegisterCitation.length;
                                    var edocs_federalRegisterCitation_array = [];
                                    
                                    for (var i = 0; i < total_edocs_federalRegisterCitation; i +=2)
                                    {
                                        edocs_federalRegisterCitation_array.push({ name: data.facet_counts.facet_fields.federalRegisterCitation[i], count: data.facet_counts.facet_fields.federalRegisterCitation[i+1], value: data.facet_counts.facet_fields.federalRegisterCitation[i], selected:false});
                                    }
                                    
                                    var total_edocs_fccNo = data.facet_counts.facet_fields.fccNo.length;
                                    var edocs_fccNo_array = [];
                                    
                                    for (var i = 0; i < total_edocs_fccNo; i +=2)
                                    {
                                        edocs_fccNo_array.push({ name: data.facet_counts.facet_fields.fccNo[i], count: data.facet_counts.facet_fields.fccNo[i+1], value: data.facet_counts.facet_fields.fccNo[i], selected:false});
                                    }
                                    
                                    var total_edocs_daNo = data.facet_counts.facet_fields.daNo.length;
                                    var edocs_daNo_array = [];
                                    
                                    for (var i = 0; i < total_edocs_daNo; i +=2)
                                    {
                                        edocs_daNo_array.push({ name: data.facet_counts.facet_fields.daNo[i], count: data.facet_counts.facet_fields.daNo[i+1], value: data.facet_counts.facet_fields.daNo[i], selected:false});
                                    }
                                    
                                    var total_edocs_fccRecord = data.facet_counts.facet_fields.fccRecord.length;
                                    var edocs_fccRecord_array = [];
                                    
                                    for (var i = 0; i < total_edocs_fccRecord; i +=2)
                                    {
                                        edocs_fccRecord_array.push({ name: data.facet_counts.facet_fields.fccRecord[i], count: data.facet_counts.facet_fields.fccRecord[i+1], value: data.facet_counts.facet_fields.fccRecord[i], selected:false});
                                    }
                                    
                                    var total_edocs_fileNumber= data.facet_counts.facet_fields.fileNumber.length;
                                    var edocs_fileNumber_array = [];
                                    
                                    for (var i = 0; i < total_edocs_fileNumber; i +=2)
                                    {
                                        edocs_fileNumber_array.push({ name: data.facet_counts.facet_fields.fileNumber[i], count: data.facet_counts.facet_fields.fileNumber[i+1], value: data.facet_counts.facet_fields.fileNumber[i], selected:false});
                                    }
                                    
                                    var total_edocs_reportNumber= data.facet_counts.facet_fields.reportNumber.length;
                                    var edocs_reportNumber_array = [];
                                    
                                    for (var i = 0; i < total_edocs_reportNumber; i +=2)
                                    {
                                        edocs_reportNumber_array.push({ name: data.facet_counts.facet_fields.reportNumber[i], count: data.facet_counts.facet_fields.reportNumber[i+1], value: data.facet_counts.facet_fields.reportNumber[i], selected:false});
                                    }
                                    
                                     var total_edocs_FCC_CaseCitations = data.facet_counts.facet_fields.FCC_CaseCitations.length;
                                    var edocs_FCC_CaseCitations_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_CaseCitations; i +=2)
                                    {
                                        edocs_FCC_CaseCitations_array.push({ name: data.facet_counts.facet_fields.FCC_CaseCitations[i], count: data.facet_counts.facet_fields.FCC_CaseCitations[i+1], value: data.facet_counts.facet_fields.FCC_CaseCitations[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Dollars = data.facet_counts.facet_fields.FCC_Dollars.length;
                                    var edocs_FCC_Dollars_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Dollars; i +=2)
                                    {
                                        edocs_FCC_Dollars_array.push({ name: data.facet_counts.facet_fields.FCC_Dollars[i], count: data.facet_counts.facet_fields.FCC_Dollars[i+1], value: data.facet_counts.facet_fields.FCC_Dollars[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Frequencies = data.facet_counts.facet_fields.FCC_Frequencies.length;
                                    var edocs_FCC_Frequencies_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Frequencies; i +=2)
                                    {
                                        edocs_FCC_Frequencies_array.push({ name: data.facet_counts.facet_fields.FCC_Frequencies[i], count: data.facet_counts.facet_fields.FCC_Frequencies[i+1], value: data.facet_counts.facet_fields.FCC_Frequencies[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Rules = data.facet_counts.facet_fields.FCC_Rules.length;
                                    var edocs_FCC_Rules_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Rules; i +=2)
                                    {
                                        edocs_FCC_Rules_array.push({ name: data.facet_counts.facet_fields.FCC_Rules[i], count: data.facet_counts.facet_fields.FCC_Rules[i+1], value: data.facet_counts.facet_fields.FCC_Rules[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Codes = data.facet_counts.facet_fields.FCC_Codes.length;
                                    var edocs_FCC_Codes_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Codes; i +=2)
                                    {
                                        edocs_FCC_Codes_array.push({ name: data.facet_counts.facet_fields.FCC_Codes[i], count: data.facet_counts.facet_fields.FCC_Codes[i+1], value: data.facet_counts.facet_fields.FCC_Codes[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Records = data.facet_counts.facet_fields.FCC_Records.length;
                                    var edocs_FCC_Records_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Records; i +=2)
                                    {
                                        edocs_FCC_Records_array.push({ name: data.facet_counts.facet_fields.FCC_Records[i], count: data.facet_counts.facet_fields.FCC_Records[i+1], value: data.facet_counts.facet_fields.FCC_Records[i], selected:false});
                                    }
                                    
                                    var total_edocs_FCC_Forms = data.facet_counts.facet_fields.FCC_Forms.length;
                                    var edocs_FCC_Forms_array = [];
                                    
                                    for (var i = 0; i < total_edocs_FCC_Forms; i +=2)
                                    {
                                        edocs_FCC_Forms_array.push({ name: data.facet_counts.facet_fields.FCC_Forms[i], count: data.facet_counts.facet_fields.FCC_Forms[i+1], value: data.facet_counts.facet_fields.FCC_Forms[i], selected:false});
                                    }
                                    
                                     
                                      
                                    var total_edocs_topics = data.facet_counts.facet_fields.topics.length;
                                    var edocs_topics_array = [];
                                    
                                    for (var i = 0; i < total_edocs_topics; i +=2)
                                    {
                                        edocs_topics_array.push({ name: data.facet_counts.facet_fields.topics[i], count: data.facet_counts.facet_fields.topics[i+1], value: data.facet_counts.facet_fields.topics[i], selected:false});
                                    }
                                    
                                    
                                    var current_year = new Date().getFullYear();

                                    var edocs_last_modified_date_facet="";
                                    var edocs_adopted_date_facet="";
                                    var edocs_reply_comment_date_facet="";
                               
                                    var edocs_dates_facet_array = [];

                                    for (var i = 0; i < 5; i++)
                                    {
                                        var year = current_year - i;
                                        var first_day = new Date(year, 0, 1);
                                        var last_day = new Date(year, 11, 31);

                                        var first_day_iso_date = first_day.toISOString();
                                        var last_day_iso_date = last_day.toISOString();

                                        var date_range = first_day_iso_date + " TO " + last_day_iso_date;

                                        var edocs_last_modified_date_query = "lastModifiedDate:[" + date_range + "]";
                                        var edocs_adopted_date_query = "adoptedDate:[" + date_range + "]";
                                        var edocs_reply_comment_date_query = "replyCommentDate:[" + date_range + "]";

                                        edocs_last_modified_date_facet += "&facet.query=" + edocs_last_modified_date_query;
                                        edocs_adopted_date_facet += "&facet.query=" + edocs_adopted_date_query;
                                        edocs_reply_comment_date_facet += "&facet.query=" + edocs_reply_comment_date_query;
                                       
                                        var edocs_yearly_object = {"year": year, "last_modified_date": edocs_last_modified_date_query, "edocs_adopted_date": edocs_adopted_date_query, "edocs_reply_comment_date": edocs_reply_comment_date_query};
                                        edocs_dates_facet_array.push(edocs_yearly_object);
                                    }

                                    var edocs_date_facets = edocs_last_modified_date_facet + edocs_adopted_date_facet + edocs_reply_comment_date_facet;

                                    var total_edocs_date_facets = edocs_dates_facet_array.length;
                                    
                                    var edocs_adoptedDate_array = [];
                                   var edocs_replyCommentDate_array = [];
                                   var edocs_lastModifiedDate_array = [];
                                    
                                     for (var i = 0; i < total_edocs_date_facets; i ++)
                                     {
                                         var d1 = edocs_dates_facet_array[i].last_modified_date;
                                         var d2 = edocs_dates_facet_array[i].edocs_adopted_date;
                                         var d3 = edocs_dates_facet_array[i].edocs_reply_comment_date;
                                         var d4 = data.facet_counts.facet_queries[d1];
                                         var d5 = data.facet_counts.facet_queries[d2];
                                         var d6 = data.facet_counts.facet_queries[d3];
                                         edocs_lastModifiedDate_array.push({ name: edocs_dates_facet_array[i].year, count: d4, value: edocs_dates_facet_array[i].year, selected:false});
                                        edocs_adoptedDate_array.push({ name: edocs_dates_facet_array[i].year, count: d5, value: edocs_dates_facet_array[i].year, selected:false});
                                        edocs_replyCommentDate_array.push({ name: edocs_dates_facet_array[i].year, count: d6, value: edocs_dates_facet_array[i].year, selected:false});
                                     }
                                    
                                    

                             var filter_headers = facet_filters.headers;
                                
                             for (var i = 0; i < filter_headers.length; i++)
                             {
                                for (var j = 0; j < filter_headers[i].children.length; j++)
                                {
                                    switch(filter_headers[i].children[j].facet)
                                    {
                                        
                                         case "adoptedDate":
                                            filter_headers[i].children[j].children = edocs_adoptedDate_array;
                                            break;
                                        case "replyCommentDate":
                                            filter_headers[i].children[j].children = edocs_replyCommentDate_array;
                                            break;
                                        case "lastModifiedDate":
                                            filter_headers[i].children[j].children =  edocs_lastModifiedDate_array;
                                            break;
                                        
                                        case "FCC_Rules":
                                            filter_headers[i].children[j].children = edocs_FCC_Rules_array;
                                            break;
                                        case "FCC_Codes":
                                            filter_headers[i].children[j].children = edocs_FCC_Codes_array;
                                            break;
                                        case "FCC_Records":
                                            filter_headers[i].children[j].children = edocs_FCC_Records_array;
                                            break;
                                        case "fccRecord":
                                            filter_headers[i].children[j].children = edocs_fccRecord_array;
                                            break;
                                        case "FCC_Forms":
                                            filter_headers[i].children[j].children = edocs_FCC_Forms_array;
                                            break;
                                            
                                         case "FCC_CaseCitations":
                                            filter_headers[i].children[j].children = edocs_FCC_CaseCitations_array;
                                            break;
                                        case "FCC_Dollars":
                                            filter_headers[i].children[j].children = edocs_FCC_Dollars_array;
                                            break;
                                        case "FCC_Frequencies":
                                            filter_headers[i].children[j].children = edocs_FCC_Frequencies_array;
                                            break;
                                        case "FCC_CallSigns":
                                            filter_headers[i].children[j].children = edocs_call_signs_array;
                                            break;
                                            
                                            
                                        case "topics":
                                            filter_headers[i].children[j].children = edocs_topics_array;
                                            break;
                                        case "bureaus":
                                            filter_headers[i].children[j].children = edocs_bureaus_array;
                                            break;
                                        case "documentCategory":
                                            filter_headers[i].children[j].children = edocs_documentCategory_array;
                                            break;
                                        case "docTypes":
                                            filter_headers[i].children[j].children = edocs_docTypes_array;
                                            break;
                                            
                                         case "dockets":
                                            filter_headers[i].children[j].children = edocs_dockets_array;
                                            break;
                                        case "fccNo":
                                            filter_headers[i].children[j].children = edocs_fccNo_array;
                                            break;
                                        case "daNo":
                                            filter_headers[i].children[j].children = edocs_daNo_array;
                                            break;
                                        
                                         case "fileNumber":
                                            filter_headers[i].children[j].children = edocs_fileNumber_array;
                                            break;
                                        case "reportNumber":
                                            filter_headers[i].children[j].children = edocs_reportNumber_array;
                                            break;
                                        case "federalRegisterCitation":
                                            filter_headers[i].children[j].children = edocs_federalRegisterCitation_array;
                                            break;
                                    }
                                }
                             }

                           $scope.data = filter_headers;
                           break;
                       case "web": 
                                   $("#tab_web").addClass('pressed');
                                    $("#tab_all").removeClass('pressed');
                                    $("#tab_edocs").removeClass('pressed');
                                    $scope.search_facets = false;
                                    $scope.search_docs = true;
                                    
                                    var total_web_call_signs = data.facet_counts.facet_fields.FCC_CallSigns.length;
                                    var web_call_signs_array = [];
                                    
                                    for (var i = 0; i < total_web_call_signs; i +=2)
                                    {
                                        web_call_signs_array.push({ name: data.facet_counts.facet_fields.FCC_CallSigns[i], count: data.facet_counts.facet_fields.FCC_CallSigns[i+1], value: data.facet_counts.facet_fields.FCC_CallSigns[i], selected:false});
                                    }
                                    
                                    var total_web_topics = data.facet_counts.facet_fields.topics.length;
                                    var web_topics_array = [];
                                    
                                    for (var i = 0; i < total_web_topics; i +=2)
                                    {
                                        web_topics_array.push({ name: data.facet_counts.facet_fields.topics[i], count: data.facet_counts.facet_fields.topics[i+1], value: data.facet_counts.facet_fields.topics[i], selected:false});
                                    }
                                    
                                     var total_web_authors = data.facet_counts.facet_fields.authors.length;
                                    var web_authors_array = [];
                                    
                                    for (var i = 0; i < total_web_authors; i +=2)
                                    {
                                        web_authors_array.push({ name: data.facet_counts.facet_fields.authors[i], count: data.facet_counts.facet_fields.authors[i+1], value: data.facet_counts.facet_fields.authors[i], selected:false});
                                    }
                                    
                                    var total_web_taxonomies = data.facet_counts.facet_fields.taxonomies.length;
                                    var web_taxonomies_array = [];
                                    
                                    for (var i = 0; i < total_web_taxonomies; i +=2)
                                    {
                                        web_taxonomies_array.push({ name: data.facet_counts.facet_fields.taxonomies[i], count: data.facet_counts.facet_fields.taxonomies[i+1], value: data.facet_counts.facet_fields.taxonomies[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_CaseCitations = data.facet_counts.facet_fields.FCC_CaseCitations.length;
                                    var web_FCC_CaseCitations_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_CaseCitations; i +=2)
                                    {
                                        web_FCC_CaseCitations_array.push({ name: data.facet_counts.facet_fields.FCC_CaseCitations[i], count: data.facet_counts.facet_fields.FCC_CaseCitations[i+1], value: data.facet_counts.facet_fields.FCC_CaseCitations[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Dollars = data.facet_counts.facet_fields.FCC_Dollars.length;
                                    var web_FCC_Dollars_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Dollars; i +=2)
                                    {
                                        web_FCC_Dollars_array.push({ name: data.facet_counts.facet_fields.FCC_Dollars[i], count: data.facet_counts.facet_fields.FCC_Dollars[i+1], value: data.facet_counts.facet_fields.FCC_Dollars[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Frequencies = data.facet_counts.facet_fields.FCC_Frequencies.length;
                                    var web_FCC_Frequencies_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Frequencies; i +=2)
                                    {
                                        web_FCC_Frequencies_array.push({ name: data.facet_counts.facet_fields.FCC_Frequencies[i], count: data.facet_counts.facet_fields.FCC_Frequencies[i+1], value: data.facet_counts.facet_fields.FCC_Frequencies[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Rules = data.facet_counts.facet_fields.FCC_Rules.length;
                                    var web_FCC_Rules_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Rules; i +=2)
                                    {
                                        web_FCC_Rules_array.push({ name: data.facet_counts.facet_fields.FCC_Rules[i], count: data.facet_counts.facet_fields.FCC_Rules[i+1], value: data.facet_counts.facet_fields.FCC_Rules[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Codes = data.facet_counts.facet_fields.FCC_Codes.length;
                                    var web_FCC_Codes_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Codes; i +=2)
                                    {
                                        web_FCC_Codes_array.push({ name: data.facet_counts.facet_fields.FCC_Codes[i], count: data.facet_counts.facet_fields.FCC_Codes[i+1], value: data.facet_counts.facet_fields.FCC_Codes[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Records = data.facet_counts.facet_fields.FCC_Records.length;
                                    var web_FCC_Records_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Records; i +=2)
                                    {
                                        web_FCC_Records_array.push({ name: data.facet_counts.facet_fields.FCC_Records[i], count: data.facet_counts.facet_fields.FCC_Records[i+1], value: data.facet_counts.facet_fields.FCC_Records[i], selected:false});
                                    }
                                    
                                    var total_web_FCC_Forms = data.facet_counts.facet_fields.FCC_Forms.length;
                                    var web_FCC_Forms_array = [];
                                    
                                    for (var i = 0; i < total_web_FCC_Forms; i +=2)
                                    {
                                        web_FCC_Forms_array.push({ name: data.facet_counts.facet_fields.FCC_Forms[i], count: data.facet_counts.facet_fields.FCC_Forms[i+1], value: data.facet_counts.facet_fields.FCC_Forms[i], selected:false});
                                    }
                                    
                                    var current_year = new Date().getFullYear();

                                    var web_date_facet="";
                                    var web_changed_facet="";

                                    var web_dates_facet_array = [];
                                    
                                    for (var i = 0; i < 5; i++)
                                    {
                                        var year = current_year - i;
                                        var first_day = new Date(year, 0, 1);
                                        var last_day = new Date(year, 11, 31);

                                        var first_day_iso_date = first_day.toISOString();
                                        var last_day_iso_date = last_day.toISOString();

                                        var date_range = first_day_iso_date + " TO " + last_day_iso_date;

                                        var web_date_query = "date:[" + date_range + "]";
                                        var web_changed_query = "changed:[" + date_range + "]";
                                        
                                        web_date_facet += "&facet.query=" + web_date_query;
                                        web_changed_facet += "&facet.query=" + web_changed_query;

                                        var web_yearly_object = {"year": year, "date": web_date_query, "changed": web_changed_query};
                                        web_dates_facet_array.push(web_yearly_object);
                                    ;}
                                
                                    var web_date_facets = web_date_facet+  web_changed_facet;
                                    var total_web_date_facets = web_dates_facet_array.length;
                                    
                                    var web_lastChangedDate_array = [];
                                    var web_releasedDate_array = [];
                                    
                                     for (var i = 0; i < total_web_date_facets; i ++)
                                     {
                                         var d = web_dates_facet_array[i].date;
                                         var d1 = data.facet_counts.facet_queries[d];
                                         var d2 = web_dates_facet_array[i].changed;
                                         var d3 = data.facet_counts.facet_queries[d2];
                                        web_lastChangedDate_array.push({ name: web_dates_facet_array[i].year, count: d1, value: web_dates_facet_array[i].year, selected:false});
                                        web_releasedDate_array.push({ name: web_dates_facet_array[i].year, count: d3, value: web_dates_facet_array[i].year, selected:false});
                                     }
                                    
                       var filter_headers = facet_filters.headers;
                                
                             for (var i = 0; i < filter_headers.length; i++)
                             {
                                for (var j = 0; j < filter_headers[i].children.length; j++)
                                {
                                    switch(filter_headers[i].children[j].facet)
                                    {
                                        
                                         case "date":
                                            filter_headers[i].children[j].children = web_releasedDate_array;
                                            break;
                                        case "changed":
                                            filter_headers[i].children[j].children =  web_lastChangedDate_array;
                                            break;
                                        
                                        case "FCC_Rules":
                                            filter_headers[i].children[j].children = web_FCC_Rules_array;
                                            break;
                                        case "FCC_Codes":
                                            filter_headers[i].children[j].children = web_FCC_Codes_array;
                                            break;
                                        case "FCC_Records":
                                            filter_headers[i].children[j].children = web_FCC_Records_array;
                                            break;
                                        case "FCC_Forms":
                                            filter_headers[i].children[j].children = web_FCC_Forms_array;
                                            break;
                                            
                                         case "FCC_CaseCitations":
                                            filter_headers[i].children[j].children = web_FCC_CaseCitations_array;
                                            break;
                                        case "FCC_Dollars":
                                            filter_headers[i].children[j].children = web_FCC_Dollars_array;
                                            break;
                                        case "FCC_Frequencies":
                                            filter_headers[i].children[j].children = web_FCC_Frequencies_array;
                                            break;
                                        case "FCC_CallSigns":
                                            filter_headers[i].children[j].children = web_call_signs_array;
                                            break;
                                            
                                            
                                        case "topics":
                                            filter_headers[i].children[j].children = web_topics_array;
                                            break;
                                        case "taxonomies":
                                            filter_headers[i].children[j].children = web_taxonomies_array;
                                            break;
                                        case "authors":
                                            filter_headers[i].children[j].children = web_authors_array;
                                            break;
                                    }
                                }
                             }
                            $scope.data = filter_headers;
                           break;
                   }
            }
        });
        
    }
 
 
 
  //////////////////// Modal ///////////////
  
   $scope.modal_open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'modal.html',
      controller: 'modalInstanceController',
      size: size,
      resolve: {
      }
    });

    modalInstance.result.then(function () {
    }, function () {
    });
  };
  
  
  //////////////// End Modal //////////////
  
  
  /////////////// date picker ////////////////
  
   $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  
  
  ////////////// Date picker ended   ///////////////
  
}]);


app.controller('modalInstanceController', function ($scope, $modalInstance) {

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
   
 app.filter('isArray', function() {
    return function (input) {
        if(input)
        {
            if (angular.isArray(input))
            {
                return input[0];
            }
            else
            {
                return input;
            }
        }
        else
        {
            return new Date();
        }
    };
 });
 