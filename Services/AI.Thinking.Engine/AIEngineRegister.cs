using AI.FamilyEdication.ThinkingEngine.EngineModel;

namespace AI.Thinking.Engine
{
    public interface IAIEngineRegister
    {
        EngineRegisterModel Model { get; }
        void LoadModel(EngineRegisterModel model);
    }

    public class AIEngineRegister : IAIEngineRegister
    {
        public EngineRegisterModel Model { get; private set; } = new EngineRegisterModel();

        public void LoadModel(EngineRegisterModel model)
        {
            Model = model;
        }
    }
}