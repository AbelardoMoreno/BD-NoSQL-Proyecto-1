use ProyectoCriaturas;

/////////////////////////consulta1////////////////////////////////////
//     muestre los animales que posean dos características dadas.   //
//////////////////////////////////////////////////////////////////////

db.criaturas.aggregate([
    {
        $match:{
            "caracteristicas.adiestrable":"no"
        },
    },
    {
        $match:{
            "caracteristicas.color":"verde"
        },
    }
]).pretty();

/////////////////////////consulta2////////////////////////////////////
//      Usando la técnica de MapReduce elabore una consulta que     //
//   muestre los animales pertenecientes a una región en específico.//
//////////////////////////////////////////////////////////////////////

var map = function(){
    for(var i=0; i<this.region.length; i++){
        if(this.region[i] === "england"){
            var values= {"region":this.region[i]};
            var key= {"_id":this._id,"nombre":this.nombre};
            emit(key,values);           
        };
    };        
};

var reduce = function(key,values){

    for(var i=0; i<values.length; i++){
         return values[i];    
    }  
};

db.criaturas.mapReduce(map,reduce,{query:{region:"england"},out:"mapReduce"});
db.mapReduce.find().pretty();



/////////////////////////consulta3////////////////////////////////////
//   Usando la técnica de MapReduce elabore una consulta que cuente //
//   la cantidad de animales según la clasificación del Ministerio. //
//////////////////////////////////////////////////////////////////////

var mapBeast = function(){   
        if(this.clasificacion === "beast"){
            var key= {"clasificacion":this.clasificacion};
            var values= {"cantidad":1};           
            emit(key,1);           
        };  
};

var mapBeing = function(){   
        if(this.clasificacion === "being"){
            var key= {"clasificacion":this.clasificacion};
            var values= {"cantidad":1};           
            emit(key,1);           
        };  
};

var mapSpirit = function(){   
        if(this.clasificacion === "spirit"){
            var key= {"clasificacion":this.clasificacion};
            var values= {"cantidad":1};           
            emit(key,1);           
        };  
};

var reduce = function(key,values){

    return Array.sum(values); 

};

db.criaturas.mapReduce(mapBeast,reduce,{out:{reduce:"joined"}});
db.criaturas.mapReduce(mapSpirit,reduce,{out:{reduce:"joined"}});
db.criaturas.mapReduce(mapBeing,reduce,{out:{reduce:"joined"}});
db.joined.find().pretty();
db.joined.remove({})

/////////////////////////consulta4////////////////////////////////////
//              Dada una característica, mostrar todas              //
//                  las criaturas que la posean.                    //
//////////////////////////////////////////////////////////////////////
db.criaturas.aggregate([
    {
        $match:{
            "caracteristicas.venenosa":"si"
        }
    },
    {
        $project:{
            _id:0,
            nombre:1,
            caracteristicas:1
        }	
    }
]).pretty();

/////////////////////////consulta5////////////////////////////////////
//          Dada una criatura, mostrar todas aquellas               //
//                  que comparten su mismo tipo.                    //
//////////////////////////////////////////////////////////////////////

var tipoCriatura= db.criaturas.aggregate([
    {
        $match:{
            "nombre":"salamander"
        }
    },
    {
        $project:{
            _id:0,
            tipo:1
        }
    }
]).map(function(mismoTipo){return mismoTipo.tipo; });

db.criaturas.find({tipo:{$in:tipoCriatura}}).pretty();

/////////////////////////consulta6////////////////////////////////////
//               Mostrar cuál es el tipo de criatura                //
//           cuyo promedio de vida media sea el más alto.           //
//////////////////////////////////////////////////////////////////////

db.criaturas.aggregate([
    {
        $group:{
            _id:"$tipo",
            "promedio_tiempo_de_vida":{$avg:"$tiempo_de_vida"}
        }
    },
    {
        $sort:{          
            "promedio_tiempo_de_vida":-1
        }
    },
     {
        $limit:1
    },
]).pretty();

////////////////////Explain/////////////////////////////////////////////
db.criaturas.find({"clasificacion":"spirit"}).explain("executionStats");