using APPCORE;
using APPCORE.BDCore.Abstracts;
namespace BusinessLogic.Connection
{
	public class BDConnection
	{
		public WDataMapper? BDOrigen { get; set; }
		public WDataMapper? BDDestino { get; set; }
		public BDConnection()
		{
			BDOrigen = SqlADOConexion.BuildDataMapper("JB\\SQLEXPRESS", "sa", "123", "BDOrigenBiblioteca");
			BDDestino = SqlADOConexion.BuildDataMapper("JB\\SQLEXPRESS", "sa", "123", "DW_Biblioteca_MINED");
			BDDestino?.GDatos.TestConnection();
			BDOrigen?.GDatos.TestConnection();
		}

		public bool InitMainConnection(bool isDebug = false)
		{
			return SqlADOConexion.IniciarConexion("sa", "123", "JB\\SQLEXPRESS", "DW_Biblioteca_MINED");
		}
	}
}