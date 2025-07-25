🔍 DASHBOARD - Funcionário completo: {
  "id": "f25afdee-752e-4ef1-9fac-9e8fe25e2c51",
  "nome": "Priscilla Sarmento",
  "email": "priscilla.sarmentof@gmail.com",
  "nivel_acesso": "funcionario",
  "ativo": true,
  "user_id": "f25afdee-752e-4ef1-9fac-9e8fe25e2c51"
}
FuncionariosDashboard.tsx:75 🔍 DASHBOARD - ID que será usado: f25afdee-752e-4ef1-9fac-9e8fe25e2c51
FuncionariosDashboard.tsx:76 🔍 DASHBOARD - Email do funcionário: priscilla.sarmentof@gmail.com
FuncionariosDashboard.tsx:83 🔧 DASHBOARD - ID corrigido: 27c7b730-661b-438e-b3f3-eba5fbbdd7ce
useDashboard.ts:295 🔄 Atribuindo lead: {
  "leadId": "789042c8-5d98-4e8a-bea8-7b014bffeb95",
  "funcionarioId": "27c7b730-661b-438e-b3f3-eba5fbbdd7ce"
}
FuncionariosDashboard.tsx:53 🔍 FILTRO - Funcionário ID: f25afdee-752e-4ef1-9fac-9e8fe25e2c51
FuncionariosDashboard.tsx:54 🔍 FILTRO - Filtros aplicados: {funcionario_id: 'f25afdee-752e-4ef1-9fac-9e8fe25e2c51'}
@supabase_supabase-js.js?v=0cd77768:3922  PATCH https://rsydniuoipecgsocsuim.supabase.co/rest/v1/leads?id=eq.789042c8-5d98-4e8a-bea8-7b014bffeb95&funcionario_id=is.null 409 (Conflict)
(anonymous) @ @supabase_supabase-js.js?v=0cd77768:3922
(anonymous) @ @supabase_supabase-js.js?v=0cd77768:3943
fulfilled @ @supabase_supabase-js.js?v=0cd77768:3895
Promise.then
step @ @supabase_supabase-js.js?v=0cd77768:3908
(anonymous) @ @supabase_supabase-js.js?v=0cd77768:3910
__awaiter6 @ @supabase_supabase-js.js?v=0cd77768:3892
(anonymous) @ @supabase_supabase-js.js?v=0cd77768:3933
then @ @supabase_supabase-js.js?v=0cd77768:89Understand this error
useDashboard.ts:326 ❌ Erro ao atribuir lead: {
  "code": "23503",
  "details": "Key is not present in table \"funcionarios\".",
  "hint": null,
  "message": "insert or update on table \"leads\" violates foreign key constraint \"leads_funcionario_id_fkey\""
}
assignLeadToFuncionario @ useDashboard.ts:326
await in assignLeadToFuncionario
handleAceitarLead @ FuncionariosDashboard.tsx:85
handleAcceptLead @ AvailableLeadsTable.tsx:41
onClick @ AvailableLeadsTable.tsx:191
callCallback2 @ chunk-W6L2VRDA.js?v=796e9a7f:3674
invokeGuardedCallbackDev @ chunk-W6L2VRDA.js?v=796e9a7f:3699
invokeGuardedCallback @ chunk-W6L2VRDA.js?v=796e9a7f:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-W6L2VRDA.js?v=796e9a7f:3736
executeDispatch @ chunk-W6L2VRDA.js?v=796e9a7f:7014
processDispatchQueueItemsInOrder @ chunk-W6L2VRDA.js?v=796e9a7f:7034
processDispatchQueue @ chunk-W6L2VRDA.js?v=796e9a7f:7043
dispatchEventsForPlugins @ chunk-W6L2VRDA.js?v=796e9a7f:7051
(anonymous) @ chunk-W6L2VRDA.js?v=796e9a7f:7174
batchedUpdates$1 @ chunk-W6L2VRDA.js?v=796e9a7f:18913
batchedUpdates @ chunk-W6L2VRDA.js?v=796e9a7f:3579
dispatchEventForPluginEventSystem @ chunk-W6L2VRDA.js?v=796e9a7f:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-W6L2VRDA.js?v=796e9a7f:5478
dispatchEvent @ chunk-W6L2VRDA.js?v=796e9a7f:5472
dispatchDiscreteEvent @ chunk-W6L2VRDA.js?v=796e9a7f:5449Understand this error
useDashboard.ts:349 🆕 Buscando leads disponíveis (funcionario_id IS NULL)
FuncionariosDashboard.tsx:53 🔍 FILTRO - Funcionário ID: f25afdee-752e-4ef1-9fac-9e8fe25e2c51
FuncionariosDashboard.tsx:54 🔍 FILTRO - Filtros aplicados: {funcionario_id: 'f25afdee-752e-4ef1-9fac-9e8fe25e2c51'}
useDashboard.ts:377 ✅ Leads disponíveis encontrados: 1
FuncionariosDashboard.tsx:53 🔍 FILTRO - Funcionário ID: f25afdee-752e-4ef1-9fac-9e8fe25e2c51
FuncionariosDashboard.tsx:54 🔍 FILTRO - Filtros aplicados: {funcionario_id: 'f25afdee-752e-4ef1-9fac-9e8fe25e2c51'}
useDashboard.ts:349 🆕 Buscando leads disponíveis (funcionario_id IS NULL)
useDashboard.ts:377 ✅ Leads disponíveis encontrados: 1