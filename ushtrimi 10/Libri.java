public abstract class Libri{
    private int isbn;
    private String titulli;
    private int vitiPublikimit;
public Libri( int isbn ,String titulli,int vitiPublikimit) throws LibriExeption{
   if(isbn <=0) throw new LibriExeption("ISBN eshte i pavleshem");
   if (titulli == null || titulli.trim().isEmpty() ) throw new LibriExeption("Titulli i pavlefshem");
   if (vitiPublikimit<= 0) throw new LibriExeption("Eshte i pavlefshem");
   this.isbn=isbn;
   this.titulli=titulli;
   this.vitiPublikimit=vitiPublikimit;
}
public int getIsbn(){
    return isbn;
}
public String getTitulli(){
    return titulli;
}
public void setTitulli(String titulli)throws LibriExeption{
   if (titulli == null || titulli.trim().isEmpty() ) throw new LibriExeption("Titulli i pavlefshem");
    this.titulli=titulli;
}
public int getVitiPublikimit(){
    return vitiPublikimit;
}
public void setVitiPublikimit(int vitiPublikimit)throws LibriExeption{
  if (vitiPublikimit<= 0) throw new LibriExeption("Eshte i pavlefshem");   
  this.vitiPublikimit=vitiPublikimit;
}
public abstract boolean kaDetyra();
public String toString(){
    return isbn+":"+titulli+"-"+vitiPublikimit;
}
public boolean equals(Object o){
    (o instanceof Libri){
        Libri l =(Libri )o;
        return isbn.equals(l.isbn);
    }
return false;
}
}

