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
			BDOrigen = SqlADOConexion.BuildDataMapper("JB\\SQLEXPRESS", "sa", "123", "BDOrigen");
			BDDestino = SqlADOConexion.BuildDataMapper("JB\\SQLEXPRESS", "sa", "123", "BDDestino");
			BDDestino?.GDatos.TestConnection();
			BDOrigen?.GDatos.TestConnection();
		}

		public bool InitMainConnection(bool isDebug = false)
		{
			return SqlADOConexion.IniciarConexion("sa", "123", "JB\\SQLEXPRESS", "DW_Bienestar_Psicoemocional");
		}
	}
}