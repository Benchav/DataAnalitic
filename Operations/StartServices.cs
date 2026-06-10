using APPCORE;
using BusinessLogic.Connection;
using Operations.SyntheticDataGenerator;

namespace Operations;

public class StartServices
{
    public async Task<bool> StartServicesApp()
    {
        try
        {
            Console.Write("############### BEGINNN");
            new BDConnection().InitMainConnection();
          
            await BibliotecaDataGeneratorOperation.Start();
            Console.Write("############### END");
            return true;
        }
        catch (System.Exception ex)
        {
            Console.Write(ex.Message);
            throw;
        }
    }

}

