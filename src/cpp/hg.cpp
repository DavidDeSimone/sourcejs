#include <node.h>
#include <utility>
#include <iostream>
#include <assert.h>
#include <uv.h>

#include <cstdio>
#include <iostream>
#include <memory>

#include "hg.h"

namespace hg {

  using namespace v8;
  
  v8::Persistent<v8::Function> hgRepoTemplate;
  void hgStatus(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    HandleScope scope(isolate);
    auto ptr = node::ObjectWrap::Unwrap<hgRepo>(args.Holder());
    v8::String::Utf8Value arg1(args[0]->ToString());
    std::string value(*arg1);
    v8::Local<Function> function = v8::Local<Function>::Cast(args[1]);
    auto permFunction = new (std::nothrow) v8::Persistent<Function>();
    permFunction->Reset(isolate, function);
    ptr->status(value, [permFunction] (std::string result) {
	Isolate* isolate = v8::Isolate::GetCurrent();
	HandleScope scope(isolate);
	v8::Local<Function> cb = v8::Local<Function>::New(isolate, *permFunction);
	v8::Local<Value> args[1] = {
	  v8::String::NewFromUtf8(isolate, result.c_str())
	};
        cb->Call(isolate->GetCurrentContext()->Global(), 1, args);
	permFunction->Reset();
	delete permFunction;
      });
  }
  
  void hgRepo::hgRepoConstructor(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    assert(args.IsConstructCall());
    v8::String::Utf8Value arg1(args[0]->ToString());
    std::string value(*arg1);
    auto repo = new (std::nothrow) hgRepo(std::move(value));
    repo->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  }
  
  void init(Local<Object> exports, Local<Object> module) {
    Isolate* isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);
    v8::Local<v8::FunctionTemplate> localHgRepoTemplate =
      v8::FunctionTemplate::New(isolate, hgRepo::hgRepoConstructor);
    localHgRepoTemplate->SetClassName(String::NewFromUtf8(isolate, "hgRepo"));
    v8::Local<v8::ObjectTemplate> inst = localHgRepoTemplate->InstanceTemplate();
    inst->SetInternalFieldCount(1);
    
    NODE_SET_PROTOTYPE_METHOD(localHgRepoTemplate, "status", hgStatus); 
    hgRepoTemplate.Reset(isolate, localHgRepoTemplate->GetFunction());

    exports->Set(String::NewFromUtf8(isolate, "repo"), localHgRepoTemplate->GetFunction());
  }

  NODE_MODULE(hg, init)

  hgRepo::hgRepo(std::string fullPath)
  {
    this->fullPath = std::move(fullPath);
  }

  void hgRepo::status(const std::string& flags, std::function<void(std::string)> callback)
  {
    _execute("pwd", std::move(callback));
  }

  int hgRepo::_execute(std::string action, std::function<void(std::string)> callback)
  {
    auto actionData = new (std::nothrow) ExecuteAction();
    auto work = new (std::nothrow) uv_work_t();
    work->data = static_cast<void*>(actionData);

    actionData->action = std::move(action);
    actionData->callback = std::move(callback);
    return uv_queue_work(uv_default_loop(),
		  work,
		  [] (uv_work_t* request) {
		    auto action = static_cast<ExecuteAction*>(request->data);
		    char buffer[128];
		    std::string result = "";
		    std::shared_ptr<FILE> pipe(popen(action->action.c_str(), "r"), pclose);
		    if (!pipe) return;
		    while (!feof(pipe.get()))
		    {
		      if (fgets(buffer, 128, pipe.get()) != NULL)
			result += buffer;
		    }

		    action->result = std::move(result);
		  },
		  [] (uv_work_t* request, int errorCode) {
		    auto action = static_cast<ExecuteAction*>(request->data);
		    if (action->callback != nullptr)
		    {
			action->callback(std::move(action->result));
		    }

		    delete request;
		    delete action;
		  });
  }



  
}  // namespace hg
