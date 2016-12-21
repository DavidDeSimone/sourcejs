#ifndef __HG_SOURCEJS_H
#define __HG_SOURCEJS_H

#include <string>

#define USING_SOURCEJS_NS using namespace hg;
#define SOURCEJS_NS_BEGIN namespace hg {
#define SOURCEJS_NS_END }


SOURCEJS_NS_BEGIN

class hgRepo
{
 public:
  hgRepo(std::string fullPath);
  ~hgRepo() = default;
  hgRepo(const hgRepo&) = delete;
  hgRepo& operator=(const hgRepo&) = delete;


  std::string status(const std::string& flags) const;

 private:
  std::string fullPath;
};

SOURCEJS_NS_END

#endif //  __HG_SOURCEJS_H
