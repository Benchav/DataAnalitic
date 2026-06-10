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
			// Asegurar que las bases de datos existen conectándonos a master primero
			var masterMapper = SqlADOConexion.BuildDataMapper("JB\\SQLEXPRESS", "sa", "123", "master");
			if (masterMapper != null)
			{
				try { masterMapper.GDatos.TraerDatosSQL("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'BDOrigenBiblioteca') CREATE DATABASE BDOrigenBiblioteca;"); } catch { }
				try { masterMapper.GDatos.TraerDatosSQL("IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DW_Biblioteca_MINED') CREATE DATABASE DW_Biblioteca_MINED;"); } catch { }
			}

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