public class LibriShkollor extends Libri implements Botohet{
    private String drejtimi;
public LibriShkollor(int isbn,String titulli,int vitiPublikimit,String drejtimi)throws LibriExeption{
    super(isbn, titulli, vitiPublikimit);
    if(drejtimi == null|| drejtimi.trim().isEmpty())throw new LibriExeption("Drejtimi i pavlefshem");
    this.drejtimi=drejtimi;
    
}
public String getDrejtimi(){
    return drejtimi;
}
public boolean kaDetyra(){
    return true;
}
public boolean eshteMeNgjyra(){
    return false;
}
public boolean kaKopertina(){
    return false;
}
public String toString(){
    return "Libri Shkollor"+super.toString()+
}