#ifndef __HG_SOURCEJS_H
#define __HG_SOURCEJS_H

#include <string>
#include <node.h>
#include <node_object_wrap.h>


#define USING_SOURCEJS_NS using namespace hg;
#define SOURCEJS_NS_BEGIN namespace hg {
#define SOURCEJS_NS_END }


SOURCEJS_NS_BEGIN

class hgRepo : public node::ObjectWrap
{
 public:
  hgRepo(std::string fullPath);
  ~hgRepo() = default;
  hgRepo(const hgRepo&) = delete;
  hgRepo& operator=(const hgRepo&) = delete;
  void status(const std::string& flags, std::function<void(std::string)> callback);


  static void hgRepoConstructor(const v8::FunctionCallbackInfo<v8::Value>& args);

 private:

  int _execute(std::string action, std::function<void(std::string)> callback);
  
  std::string fullPath;
};

struct ExecuteAction
{
  std::function<void(std::string)> callback;
  std::string action;
  std::string result;
};

SOURCEJS_NS_END

#endif //  __HG_SOURCEJS_H
