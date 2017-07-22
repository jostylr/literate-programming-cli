This manages the fcd, or file cache director. 

The idea of this thing is to have one object that we interface with for asking
for external resources and returning them. Each resource has the potential to
have its own caching mechanism. 

The basic flow is that a resource is asked for via `load:type:url` with a
response of `read:type:url`. For saving, we have `write:type:url` with a
response of `saved:type:url`.  There are scopes associated with url that can
contain values. 

    var reads = _"reads";

    var writes = _"writes";
    
    fcd.on("read", _"read");
    fcd.on("write", _"write");
    
    

## Read

This function is the generic listener that calls the domain specific 


