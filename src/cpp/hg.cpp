#include <node.h>
#include <utility>
#include <iostream>
#include "hg.h"

namespace hg {

  using namespace v8;
  
  v8::Persistent<v8::Function> hgRepoTemplate;
  void hgStatus(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    HandleScope scope(isolate);
    auto ptr = node::ObjectWrap::Unwrap<hgRepo>(args.Holder());
    args.GetReturnValue().Set(String::NewFromUtf8(isolate, ptr->status("").c_str()));
  }
  
  void hgRepo::hgRepoConstructor(const FunctionCallbackInfo<Value>& args)
  {
    Isolate* isolate = args.GetIsolate();
    v8::HandleScope scope(isolate);

    if (!args.IsConstructCall())
      std::cout << " DUN FUCKED UP SON " << std::endl;
    // TODO get string from args
    auto repo = new (std::nothrow) hgRepo("foo");
    repo->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  }
  
  void init(Local<Object> exports, Local<Object> module) {
    Isolate* isolate = v8::Isolate::GetCurrent();
    v8::HandleScope scope(isolate);
    v8::Local<v8::FunctionTemplate> localHgRepoTemplate = v8::FunctionTemplate::New(isolate, hgRepo::hgRepoConstructor);
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
    this->fullPath = fullPath; // TODO why dont I have c++11...
  }

  std::string hgRepo::status(const std::string& flags) const
  {
    return "no changes.";
  }




  
}  // namespace hg
