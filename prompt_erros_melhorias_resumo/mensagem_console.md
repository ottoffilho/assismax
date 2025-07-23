Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
AuthContext.tsx:183 Auth state changed: INITIAL_SESSION
AuthContext.tsx:183 Auth state changed: SIGNED_IN
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/funcionarios?select=*&email=eq.ottof6%40gmail.com&ativo=eq.true 500 (Internal Server Error)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
AuthContext.tsx:56 Erro ao buscar funcionário: Error: Funcionário não encontrado ou inativo
    at fetchFuncionario (AuthContext.tsx:50:15)
    at async Object.callback (AuthContext.tsx:188:11)
    at async @supabase_supabase-js.js?v=ba03df7a:6691:11
    at async Promise.all (index 1)
    at async SupabaseAuthClient._notifyAllSubscribers (@supabase_supabase-js.js?v=ba03df7a:6696:7)
    at async SupabaseAuthClient.signInWithPassword (@supabase_supabase-js.js?v=ba03df7a:5464:9)
    at async signIn (AuthContext.tsx:102:31)
    at async handleSubmit (Login.tsx:46:7)
fetchFuncionario @ AuthContext.tsx:56
await in fetchFuncionario
(anonymous) @ AuthContext.tsx:188
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:6691
_notifyAllSubscribers @ @supabase_supabase-js.js?v=ba03df7a:6689
signInWithPassword @ @supabase_supabase-js.js?v=ba03df7a:5464
await in signInWithPassword
signIn @ AuthContext.tsx:102
await in signIn
handleSubmit @ Login.tsx:46
callCallback2 @ chunk-FJ2A54M7.js?v=ba03df7a:3674
invokeGuardedCallbackDev @ chunk-FJ2A54M7.js?v=ba03df7a:3699
invokeGuardedCallback @ chunk-FJ2A54M7.js?v=ba03df7a:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-FJ2A54M7.js?v=ba03df7a:3736
executeDispatch @ chunk-FJ2A54M7.js?v=ba03df7a:7014
processDispatchQueueItemsInOrder @ chunk-FJ2A54M7.js?v=ba03df7a:7034
processDispatchQueue @ chunk-FJ2A54M7.js?v=ba03df7a:7043
dispatchEventsForPlugins @ chunk-FJ2A54M7.js?v=ba03df7a:7051
(anonymous) @ chunk-FJ2A54M7.js?v=ba03df7a:7174
batchedUpdates$1 @ chunk-FJ2A54M7.js?v=ba03df7a:18913
batchedUpdates @ chunk-FJ2A54M7.js?v=ba03df7a:3579
dispatchEventForPluginEventSystem @ chunk-FJ2A54M7.js?v=ba03df7a:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-FJ2A54M7.js?v=ba03df7a:5478
dispatchEvent @ chunk-FJ2A54M7.js?v=ba03df7a:5472
dispatchDiscreteEvent @ chunk-FJ2A54M7.js?v=ba03df7a:5449Understand this error
AuthContext.tsx:183 Auth state changed: SIGNED_OUT
AuthContext.tsx:124 Redirecionando usuário: Otto Fritsche Nível: admin
AuthContext.tsx:126 Redirecionando para /admin
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:62 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:62
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:190 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:190
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:73 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:73
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:201 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:201
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:62 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:62
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:190 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:190
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:73 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:73
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:201 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:201
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:62 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:62
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:190 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:190
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:73 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:73
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:201 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:201
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:62 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:62
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&slug=eq.assismax&ativo=eq.true 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89
setTimeout
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:211
sleep @ @tanstack_react-query.js?v=ba03df7a:210
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:532
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:73 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:73
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
useDashboard.ts:190 Erro ao buscar empresa por slug, tentando busca alternativa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:190
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error
@supabase_supabase-js.js?v=ba03df7a:3922  GET https://rsydniuoipecgsocsuim.supabase.co/rest/v1/empresas?select=id&ativo=eq.true&limit=1 406 (Not Acceptable)
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3922
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3943
fulfilled @ @supabase_supabase-js.js?v=ba03df7a:3895
Promise.then
step @ @supabase_supabase-js.js?v=ba03df7a:3908
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3910
__awaiter6 @ @supabase_supabase-js.js?v=ba03df7a:3892
(anonymous) @ @supabase_supabase-js.js?v=ba03df7a:3933
then @ @supabase_supabase-js.js?v=ba03df7a:89Understand this error
useDashboard.ts:201 Erro no fallback da empresa: {code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned'}
queryFn @ useDashboard.ts:201
await in queryFn
fetchFn @ @tanstack_react-query.js?v=ba03df7a:881
run @ @tanstack_react-query.js?v=ba03df7a:513
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:538
Promise.then
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:534
Promise.catch
run @ @tanstack_react-query.js?v=ba03df7a:517
start @ @tanstack_react-query.js?v=ba03df7a:555
fetch @ @tanstack_react-query.js?v=ba03df7a:969
executeFetch_fn @ @tanstack_react-query.js?v=ba03df7a:2280
onSubscribe @ @tanstack_react-query.js?v=ba03df7a:1983
subscribe @ @tanstack_react-query.js?v=ba03df7a:24
(anonymous) @ @tanstack_react-query.js?v=ba03df7a:3147
subscribeToStore @ chunk-FJ2A54M7.js?v=ba03df7a:11984
commitHookEffectListMount @ chunk-FJ2A54M7.js?v=ba03df7a:16915
commitPassiveMountOnFiber @ chunk-FJ2A54M7.js?v=ba03df7a:18156
commitPassiveMountEffects_complete @ chunk-FJ2A54M7.js?v=ba03df7a:18129
commitPassiveMountEffects_begin @ chunk-FJ2A54M7.js?v=ba03df7a:18119
commitPassiveMountEffects @ chunk-FJ2A54M7.js?v=ba03df7a:18109
flushPassiveEffectsImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19490
flushPassiveEffects @ chunk-FJ2A54M7.js?v=ba03df7a:19447
performSyncWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18868
flushSyncCallbacks @ chunk-FJ2A54M7.js?v=ba03df7a:9119
commitRootImpl @ chunk-FJ2A54M7.js?v=ba03df7a:19432
commitRoot @ chunk-FJ2A54M7.js?v=ba03df7a:19277
finishConcurrentRender @ chunk-FJ2A54M7.js?v=ba03df7a:18805
performConcurrentWorkOnRoot @ chunk-FJ2A54M7.js?v=ba03df7a:18718
workLoop @ chunk-FJ2A54M7.js?v=ba03df7a:197
flushWork @ chunk-FJ2A54M7.js?v=ba03df7a:176
performWorkUntilDeadline @ chunk-FJ2A54M7.js?v=ba03df7a:384Understand this error